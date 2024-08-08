import json
from helpers import arc_utils as autils, arc_vars as avars, arc_sql as asql, arc_statements as astmts, arc_validate as aval, arc_dtypes as adtypes

from analytics.data_wrangling import Filtering, Grouping
from analytics.statistics import CentralTendency, Summary, Dispersion, Tabular, Time

import google.generativeai as genai
 
# ---------- Function Callers ---------- #
def execute_function(command: genai.protos.FunctionCall):
    """
    Execute a function based on a parsed command dictionary.
    """
    try:
        # Parse the command to get the function name and arguments
        parsed_command = type(command).to_dict(command)
        func_name = parsed_command["name"]
        args = parsed_command["args"]

        # Retrieve and execute the function
        print(f"Executing function: {func_name} with args: {args}")
        function = globals()[func_name]
        print('function:', function)
        return function(**args)
    except KeyError as e:
        print(f"Error: Missing key {str(e)} in command structure.")
        return f"Error: Missing key {str(e)} in command structure."
    except TypeError as e:
        print(f"Type Error: {str(e)}")
        return f"Type Error: {str(e)}"
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return f"An error occurred: {str(e)}"
    

# ---------- Function Implementations ---------- #
def create_table(tenant_id: str, table_name: str, column_names: list[str], column_datatypes: list[str]) -> str:
    """
    Creates a new table in the database with specified columns and datatypes. Validates the table name, column names, and column datatypes, 
    and then attempts to create the table and add columns.
    """
    try:
        validation_error = aval.validate_input_func_create_table(tenant_id, table_name, column_names, column_datatypes)
        if validation_error:
            return validation_error
        
        asql.execute_raw_query(tenant=tenant_id, queries=astmts.get_create_raw_table_query(table_name))

        for i in range(len(column_names)):
            asql.execute_raw_query(tenant=tenant_id, queries=astmts.get_add_column_query(column_name=column_names[i], table_name=table_name, is_relationship=False, related_table=None, data_type=column_datatypes[i], tenant_id=tenant_id))

        return f'Successfully created table {table_name} with columns {column_names}'
    except Exception as e:
        return f'Failed to create table: {str(e)}'
    

def add_tables_to_process(table_names: list['str'], tenant_id: str, process_name: str) -> str:
    """
    Adds specified tables to a process. Tables must exist in the database.
    """
    # check if table exists in db
    try:
        tables_response_data = asql.execute_raw_query(tenant=tenant_id, queries=([("SHOW TABLES;", [])]))
        tables = []
        for response_data_item in tables_response_data:
            tables += [v for k, v in response_data_item.items() if v not in avars.INTERNAL_TABLES]

        for table_name in table_names:
            if table_name not in tables:
                return f'Table {table_name} does not exist in the database'
        
        # add table to process
        add_table_to_process_response_data = asql.execute_raw_query(tenant=tenant_id, queries=astmts.get_create_new_process_table_relationship_query(process_name, table_names))
        return f'Successfully added tables to process {process_name}'
    except Exception as e:
        return f'Failed to add tables to process: {str(e)}'
    
# ---------- Analytics Functions ---------- #
def descriptive_analytics(tenant_id:str, table_name:str, filter:dict=None, group:dict=None, column:str=None, operation:str=None):
    """
    filter = {
        'column': 'column_name',
        'condition': '>',
        'value': 10
    },
    group = {
        'column': 'column_name',
        'aggregation': 'sum'
    },
    column = 'column_name',
    operation = 'mean'
    """
    try: 
        print('in descriptive analytics', tenant_id, table_name, filter, group, column, operation)
        # if filter value is giveve, convert it to the correct data type (always comes in as string to simplify the input for AI API)
        if filter and filter.get('value'):
            print('converting filter value')
            filter['value'] = adtypes.convert_string_to_col_dtype(tenant_id, table_name, filter['column'], filter['value'])

        # get data
        response_data = asql.execute_raw_query(tenant=tenant_id, queries=astmts.get_complete_table_query(tenant_id, table_name))
        original_df = autils.get_pd_df_from_query_result(response_data)
        data = original_df.copy()

        # validate input
        validation_error = aval.validate_input_func_calling_descriptive_analytics(tenant_id, table_name, filter, group, column, operation)
        if validation_error:
            return validation_error

        # filter
        if filter:
            data = Filtering.filter_by_condition(
                data, 
                column=filter['column'], 
                condition=filter['condition'], 
                value=filter['value']
            )

        # group
        if group:
            data = Grouping.group_by_column(
                data, 
                column=group['column'], 
                aggregation=group['aggregation']
            )

        # compute
        if operation == 'mean':
            print('calling mean')
            return float(CentralTendency.mean(data, column))
        elif operation == 'median':
            print('calling median')
            return float(CentralTendency.median(data, column))
        elif operation == 'mode':
            print('calling mode')
            return float(CentralTendency.mode(data, column))
        elif operation == 'sum':
            print('calling sum')
            return float(Summary.sum(data, column))
        elif operation == 'count':
            print('calling count')
            return float(Summary.count(data, column))
        elif operation == 'range':
            print('calling range')
            return float(Dispersion.range(data, column))
        elif operation == 'frequency_distribution':
            ditribution = Tabular.frequency_distribution(data, column).to_dict()
            response_str = json.dumps(ditribution)
            return response_str
        elif operation == 'relative_frequency_distribution':
            print('calling relative_frequency_distribution')
            ditribution = Tabular.relative_frequency_distribution(data, column).to_dict()
            response_str = json.dumps(ditribution)
            return response_str
        
    except Exception as e:
        print('error in descriptive analytics:', e)
        return f"Error: {str(e)}"

def time_series_analytics(tenant_id:str, table_name:str, number_column:str, date_column:str, period:str, operation:str=None):
    print('in time series analytics', tenant_id, table_name, number_column, date_column, period, operation)
    try: 
        response_data = asql.execute_raw_query(tenant=tenant_id, queries=astmts.get_complete_table_query(tenant_id, table_name))
        original_df = autils.get_pd_df_from_query_result(response_data)
        data = original_df.copy()
        print('data:', data)
        
        # validate input
        validation_error = aval.validate_input_func_calling_time_series_analytics(tenant_id, table_name, date_column, period, operation)
        if validation_error:
            print('validation error:', validation_error)
            return validation_error
        print('validated')

        if operation == 'average_rate_of_change':
            rate_of_change = Time.average_rate_of_change(data, number_column, date_column, period)
            print('type of rate_of_change:', type(rate_of_change), rate_of_change)
            if len(rate_of_change) == 0:
                print('No rate of change available, please try again with a different period.')
                return 'No rate of change available, please try again with a different period.'
            if len(rate_of_change) == 1:
                print('Only one data point available, please try again with a different period.')
                return 'Only one data point available, please try again with a different period.'
            else:
                rate_of_change = rate_of_change.to_dict()
                response_str = json.dumps(rate_of_change)
                print('rate_of_change returned:', response_str)
                return response_str
        
    except Exception as e:
        print('error in time series analytics:', e)
        return f"Error: {str(e)}"

















if __name__ == '__main__':
    pass