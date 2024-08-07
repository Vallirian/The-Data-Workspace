from datetime import datetime
from helpers import arc_utils as autils, arc_vars as avars, arc_sql as asql, arc_statements as astmts, arc_validate as aval

from analytics.data_wrangling import Filtering, Grouping
from analytics.statistics import CentralTendency, Summary, Dispersion, Position, Tabular, Time

import google.generativeai as genai
from google.protobuf import json_format
 
# ---------- Function Callers ---------- #
def execute_function(command: genai.protos.FunctionCall):
    """
    Execute a function based on a parsed command dictionary.
    """
    # print('executing function', command)
    try:
        # Parse the command to get the function name and arguments
        parsed_command = type(command).to_dict(command)
        func_name = parsed_command["name"]
        args = parsed_command["args"]

        # Retrieve and execute the function
        function = globals()[func_name]
        return function(**args)
    except KeyError as e:
        return f"Error: Missing key {str(e)} in command structure."
    except TypeError as e:
        return f"Type Error: {str(e)}"
    except Exception as e:
        return f"An error occurred: {str(e)}"
    

# ---------- Function Implementations ---------- #
def create_table(tenant_id: str, table_name: str, column_names: list[str], column_datatypes: list[str]) -> str:
    """
    Creates a new table in the database with specified columns and datatypes. Validates the table name, column names, and column datatypes, 
    and then attempts to create the table and add columns.
    """
    # validate table name
    if not table_name:
        return 'Table name is required'
    table_name_valid, table_name_validation_error = autils.validate_object_name(table_name)
    if not table_name_valid:
        return table_name_validation_error
    
    # validate columns
    if not column_names:
        return 'Column names are required'
    if not column_datatypes:
        return 'Column datatypes are required'
    if len(column_names) != len(column_datatypes):
        return 'Column names and datatypes must be of the same length'
    if len(column_names) != len(set(column_names)):
        return 'Column names must be unique'
    
    # validate column datatypes
    for datatype in column_datatypes:
        if datatype not in avars.DATA_TYPE_MAP.keys():
            return f"Invalid column datatype: {datatype}"
    try:
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
    tables_response_data = asql.execute_raw_query(tenant=tenant_id, queries=([("SHOW TABLES;", [])]))
    tables = []
    for response_data_item in tables_response_data:
        tables += [v for k, v in response_data_item.items() if v not in avars.INTERNAL_TABLES]
    for table_name in table_names:
        if table_name not in tables:
            return f'Table {table_name} does not exist in the database'
        
        # add table to process
    try:
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
    print('descriptive analytics')
    try: 
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
            print('filtering')
            print(filter)
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
            return CentralTendency.mean(data, column)
        elif operation == 'median':
            return CentralTendency.median(data, column)
        elif operation == 'mode':
            return CentralTendency.mode(data, column)
        elif operation == 'sum':
            return Summary.sum(data, column)
        elif operation == 'count':
            return Summary.count(data, column)
        elif operation == 'range':
            return Dispersion.range(data, column)
        elif operation == 'frequency_distribution':
            return Tabular.frequency_distribution(data, column)
        elif operation == 'relative_frequency_distribution':
            return Tabular.relative_frequency_distribution(data, column)
        
    except Exception as e:
        return f"Error: {str(e)}"

def proportion_analytics(tenant_id:str, table_name:str, column:str, value:str, period:str=None, operation:str=None):
    """
    column = 'column_name',
    value = 'value_name',
    period = 'day' | 'week' | 'month' | 'day of week' | 'year'
    """
    try: 
        response_data = asql.execute_raw_query(tenant=tenant_id, queries=astmts.get_complete_table_query(tenant_id, table_name))
        original_df = autils.get_pd_df_from_query_result(response_data)
        data = original_df.copy()

        # validate input
        validation_error = aval.validate_input_func_calling_proportion_analytics(tenant_id, table_name, column, value, period, operation)
        if validation_error:
            return validation_error
        
        if operation == 'percentage':
            return  Position.percentage(data, column, value, period)

    except Exception as e:
        return f"Error: {str(e)}"

def time_series_analytics(tenant_id:str, table_name:str, number_column:str, date_column:str, period:str, operation:str=None):
    try: 
        response_data = asql.execute_raw_query(tenant=tenant_id, queries=astmts.get_complete_table_query(tenant_id, table_name))
        original_df = autils.get_pd_df_from_query_result(response_data)
        data = original_df.copy()
        
        # validate input
        validation_error = aval.validate_input_func_calling_time_series_analytics(tenant_id, table_name, date_column, period, operation)
        if validation_error:
            return validation_error

        if operation == 'average_rate_of_change':
            return Time.average_rate_of_change(data, number_column, date_column, period)
        
    except Exception as e:
        return f"Error: {str(e)}"

















if __name__ == '__main__':
    pass