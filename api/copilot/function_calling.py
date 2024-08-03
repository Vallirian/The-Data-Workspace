from datetime import datetime
from helpers import arc_utils as autils, arc_vars as avars, arc_sql as asql, arc_statements as astmts

import google.generativeai as genai
 
# ---------- Function Callers ---------- #
def parse_command(command: genai.protos.FunctionCall):
    """
    Parse a FunctionCall object from Gemini into a dictionary of function name and arguments.
    """
    function_name = command.name
    args_dict = {}

    # Loop through each field and extract the key and value
    for k, v in command.args.items():
        args_dict[k] = v

    return {'name': function_name, 'args': args_dict}

def execute_function(command: genai.protos.FunctionCall):
    """
    Execute a function based on a parsed command dictionary.
    """
    try:
        # Parse the command to get the function name and arguments
        parsed_command = parse_command(command)
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
    

def get_descriptive_analytics_for_table(
        tenant_id: str, table_name: str, filter_column: str=None, filter_value: str | float=None, 
        filter_operator: str=None, arithmetic_column: str=None, 
        arithmetic_operator: str=None
    ):
    """
    Retrieve descriptive analytics for a specified table with options for filtering by a column and applying 
    arithmetic operations on another column. For example, filter 'employees' table by 'department' with a value of 
    'Sales' using an 'equal to' operator and then apply a 'count' arithmetic operation on 'employee_id'.
    """

    try:
        # Get data
        response_data = asql.execute_raw_query(tenant=tenant_id, queries=astmts.get_complete_table_query(tenant_id, table_name))
        original_df = autils.get_pd_df_from_query_result(response_data)
        df = original_df.copy()

        # Filter data
        if filter_column and filter_value:
            if filter_operator not in ['greater than', 'less than', 'equal to', 'contains', 'not equal']:
                return 'Invalid filter operator, choose from: greater than, less than, equal to, contains, not equal'
            
            if filter_column not in df.columns:
                return 'Filter column does not exist, choose from: ' + ', '.join(df.columns)
            
            if filter_operator == 'contains':
                if type(filter_value) != str:
                    return 'Filter value must be a string for contains operator'
                df = df[df[filter_column].str.contains(filter_value, case=False)] # case insensitive
            elif filter_operator == 'not equal':
                if df[filter_column].dtype == 'object':
                    df = df[df[filter_column].str.lower() != filter_value.lower()]
                else:
                    try:
                        filter_value = float(filter_value)
                        df = df[df[filter_column] != filter_value]
                    except ValueError:
                        return 'Filter value must be a number for greater than or less than operators'

            elif filter_operator == 'greater than':
                # the filter_value always comes as a string, so we need to convert it to float
                try:
                    filter_value = float(filter_value)
                except ValueError:
                    return 'Filter value must be a number for greater than or less than operators'
                df = df[df[filter_column] > filter_value]
            elif filter_operator == 'less than':
                # the filter_value always comes as a string, so we need to convert it to float
                try:
                    filter_value = float(filter_value)
                    print('filter_value for lessthan', filter_value)
                except ValueError:
                    return 'Filter value must be a number for greater than or less than operators'
                df = df[df[filter_column] < filter_value]
                print('df after less than', df)
            elif filter_operator == 'equal to':
                if df[filter_column].dtype == 'object': # is string
                    df = df[df[filter_column].str.lower() == filter_value.lower()]
                else:
                    try:
                        filter_value = float(filter_value)
                        df = df[df[filter_column] == filter_value]
                    except ValueError:
                        return 'The filter column is not a string, so the filter value must be a number'

        # Arithmetic operations
        if arithmetic_column and arithmetic_operator:
            if arithmetic_column not in df.columns:
                return 'Arithmetic column does not exist, choose from: ' + ', '.join(df.columns)
            
            if arithmetic_operator not in ['sum', 'average', 'count', 'ratio']:
                return 'Invalid arithmetic operator, choose from: sum, average, count, ratio'
            
            # Perform operation
            df = df[arithmetic_column]
            if arithmetic_operator == 'sum':
                return float(df.sum())
            elif arithmetic_operator == 'average':
                return float(df.mean())
            elif arithmetic_operator == 'count':
                return int(df.shape[0])
            elif arithmetic_operator == 'ratio':
                if original_df.shape[0] == 0:  # Prevent division by zero
                    return 'Cannot calculate ratio: original dataset is empty'
                return float(df.shape[0] / original_df.shape[0])

    except Exception as e:
        return str(e)


def get_data_from_table_and_columns(tenant_id: str, table_name: str, columns_list: list['str']=None) -> str:
    """
    Retrieve data from a specified table and columns. The function returns the data in a dictionary format.
    """
    try:
        # get table data
        table_response_data = asql.execute_raw_query(
            tenant=tenant_id, 
            queries=[("SELECT * FROM `%s`;", [table_name])]
        )
        if not table_response_data:
            return 'Table not found'
        
        # create columns list
        all_columns_list = []
        relevant_columns = []
        for k, v in table_response_data[0].items():
            all_columns_list.append(k)

        if columns_list:
            for col in columns_list:
                if col not in all_columns_list:
                    return f'Column {col} not found in table {table_name}'
                relevant_columns.append(col)
        else:
            relevant_columns = all_columns_list

        # remove non-relevant columns
        df = autils.get_pd_df_from_query_result(table_response_data)
        df = df[relevant_columns]

        # convert data to dictionary
        data = df.to_dict()

        return data
    except Exception as e:
        print('error in get_data_from_table_and_columns', e)
        return str(e)
    
def update_row_in_table(tenant_id: str, table_name: str, row_id: int, column_names: list['str'], new_values: list['str']) -> str:
    """
    Update a row in a table with a new value for a specified column. The row is identified by its unique row ID.
    """
    try:
        # validate column name
        table_columns_response_data = asql.execute_raw_query(tenant=tenant_id, queries=astmts.get_complete_table_columns_query(table_name))
        table_columns = [col['columnName'] for col in table_columns_response_data]
        if not column_names:
            return 'Column names are required'
        for column_name in column_names:
            if column_name not in table_columns:
                return f'Column {column_name} does not exist in table {table_name}'
        
        dtype_corrected_new_values = []
        # validate new value
        if not new_values:
            return 'New values are required'
        if len(column_names) != len(new_values):
            return 'Column names and new values must be of the same length'
        for i in range(len(new_values)):
            column_datatype = [col['dataType'] for col in table_columns_response_data if col['columnName'] == column_names[i]][0]
            if column_datatype == 'number':
                try:
                    new_values[i] = float(new_values[i])
                except ValueError:
                    return f'New value for column {column_names[i]} must be a number'
            dtype_corrected_new_values.append(new_values[i])
        
        # update row
        update_row_response_data = asql.execute_raw_query(
            tenant=tenant_id, 
            queries=[(
                f"UPDATE `{table_name}` SET {', '.join([f'{column_names[i]} = %s' for i in range(len(column_names))])} WHERE `id` = %s;",
                dtype_corrected_new_values + [row_id]
            )]
        )
        return f'Successfully updated row {row_id} in table {table_name}'
    except Exception as e:
        return f'Failed to update row: {str(e)}'
    
def add_new_row_in_table(tenant_id: str, table_name: str, column_names: list['str'], new_values: list['str']) -> str:
    """
    Add a new row to a table with specified values for each column. The function validates the column names and 
    new values, and then attempts to add the new row to the table.
    """
    try:
        # validate column name
        table_columns_response_data = asql.execute_raw_query(tenant=tenant_id, queries=astmts.get_complete_table_columns_query(table_name))
        table_columns = [col['columnName'] for col in table_columns_response_data]
        if not column_names:
            return 'Column names are required'
        for column_name in column_names:
            if column_name not in table_columns:
                return f'Column {column_name} does not exist in table {table_name}'
        
        # if id is in column_names, remove it
        for i in range(len(column_names)):
            if column_names[i] == 'id':
                column_names.pop(i)
                new_values.pop(i)
                break
        if 'id' in column_names:
            return 'Cannot add new row with id column'
        
        # remove updatedAt if it exists
        for i in range(len(column_names)):
            if column_names[i] == 'updatedAt':
                column_names.pop(i)
                new_values.pop(i)
                break
        if 'updatedAt' in column_names:
            return 'Cannot add new row with updatedAt column'
        
        dtype_corrected_new_values = []
        # validate new value
        if not new_values:
            return 'New values are required'
        if len(column_names) != len(new_values):
            return 'Column names and new values must be of the same length'
        for i in range(len(new_values)):
            column_datatype = [col['dataType'] for col in table_columns_response_data if col['columnName'] == column_names[i]][0]
            if column_datatype == 'number':
                try:
                    new_values[i] = float(new_values[i])
                except ValueError:
                    return f'New value for column {column_names[i]} must be a number'
            dtype_corrected_new_values.append(new_values[i])
        
        # add row
        current_timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        add_row_response_data = asql.execute_raw_query(
            tenant=tenant_id, 
            queries=[(
                f"INSERT INTO `{table_name}` ({', '.join(column_names)}) VALUES (id, updatedAt {', '.join(['%s' for _ in range(len(column_names))])});",
                [autils.custom_uuid(), current_timestamp] + dtype_corrected_new_values
            )]
        )
        return f'Successfully added new row to table {table_name}'
    except Exception as e:
        return f'Failed to add new row: {str(e)}'


if __name__ == '__main__':
    pass