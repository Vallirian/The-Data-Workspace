import os
from helpers import arc_utils as autils, arc_vars as avars, arc_sql as asql, arc_statements as astmts

import google.generativeai as genai

# gemini chat
def enhance_process_action_user_message(message: str, tenant_id: str, current_process_name: str) -> str:
    
    try:
        base_enhacement_message = avars.PROCESS_COPILOT_USER_MESSAGE_ENHANCEMENT

        process_description_response_data = asql.execute_raw_query(
            tenant=tenant_id, 
            queries=[(
                f"SELECT * FROM `{avars.PROCESSES_TABLE_NAME}` WHERE `processName` = %s;",
                [current_process_name]
            )]
        )
        process_description = process_description_response_data[0]['processDescription']
        
        tables_response_data = asql.execute_raw_query(tenant=tenant_id, queries=([("SHOW TABLES;", [])]))
        tables = []
        for response_data_item in tables_response_data:
            tables += [v for k, v in response_data_item.items() if v not in avars.INTERNAL_TABLES]
        base_enhacement_message += f"This is a list of table_name for tables that already exist in the database: {tables}\n"

        for table in tables:
            columns_response_data = asql.execute_raw_query(tenant=tenant_id, queries=astmts.get_complete_table_columns_query(table))
            columns_response_data = autils.cast_datatype_to_python(columns_response_data)
            for i in range(len(columns_response_data)):
                if columns_response_data[i]['isRelationship']:
                    columns_response_data[i]['columnName'] = f"{columns_response_data[i]['relatedTable']}__{columns_response_data[i]['columnName']}"
            base_enhacement_message += f"The table {table} has the following columns: {columns_response_data}\n"
            base_enhacement_message += f"If the column comes from a different table that is related to {table} table, them the 'isRelationship' will be True.\n"
        
        base_enhacement_message += f"The current process the user is looking at has the process_name: {current_process_name}\n"
        base_enhacement_message += f"The current process the user is looking at has the description: {process_description}\n"
        base_enhacement_message += f"The tenant_id of the user is: {tenant_id}\n"
        base_enhacement_message += f"The user has asked the following question: {message}\n"

        print('base_enhacement_message', base_enhacement_message)
        return base_enhacement_message
    except Exception as e:
        return str(e)

def send_process_action_message(history: list['str'], message: str, tenant_id: str, process_name: str) -> str:
    genai.configure(api_key=os.environ.get("GOOGLE_AI_API_KEY"))
    final_message = enhance_process_action_user_message(message, tenant_id, process_name)

    try:
        model = genai.GenerativeModel(
            os.environ.get("GEMINI_AI_MODEL"),
            tools=[
                genai.protos.Tool(avars.PROCESS_COPILOT_ALLOWED_FUNCTIONS)
            ],
            system_instruction=avars.PROCESS_COPILOT_SYSTEM_INSTRUCTIONS,
        )
        
        gemini_chat = model.start_chat(
            history=history, 
            enable_automatic_function_calling=True
        )

        model_response = gemini_chat.send_message(
            final_message
        )

        is_function_call = 'function_call' in model_response.candidates[0].content.parts[0]
        while is_function_call:
            function_call = model_response.candidates[0].content.parts[0].function_call
            function_call_exec_result = execute_function(function_call)
            model_response = gemini_chat.send_message(
                genai.protos.Content(
                    parts=[
                        genai.protos.Part(
                            function_response=genai.protos.FunctionResponse(
                                name=function_call.name,
                                response={'result': function_call_exec_result}
                            )
                        )
                    ]
                )
            )
            print('model_response after func call', model_response)
            is_function_call = 'function_call' in model_response.candidates[0].content.parts[0]

        return model_response.text
    except Exception as e:
        print('error', e)
        return 'Unable to resolve response'

# ----- function execution -----
def parse_command(command: genai.protos.FunctionCall):
    function_name = command.name
    args_dict = {}

    # Loop through each field and extract the key and value
    for k, v in command.args.items():
        args_dict[k] = v

    return {'name': function_name, 'args': args_dict}

def execute_function(command: genai.protos.FunctionCall):
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


#  ----- database -----
def create_table(tenant_id: str, table_name: str, column_names: list[str], column_datatypes: list[str]) -> str:
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
        if datatype not in avars.data_type_map.keys():
            return f"Invalid column datatype: {datatype}"
    try:
        asql.execute_raw_query(tenant=tenant_id, queries=astmts.get_create_raw_table_query(table_name))

        for i in range(len(column_names)):
            asql.execute_raw_query(tenant=tenant_id, queries=astmts.get_add_column_query(column_name=column_names[i], table_name=table_name, is_relationship=False, related_table=None, data_type=column_datatypes[i], tenant_id=tenant_id))

        return f'Successfully created table {table_name} with columns {column_names}'
    except Exception as e:
        return f'Failed to create table: {str(e)}'

def add_tables_to_process(table_names: list['str'], tenant_id: str, process_name: str) -> str:
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


if __name__ == '__main__':
    pass