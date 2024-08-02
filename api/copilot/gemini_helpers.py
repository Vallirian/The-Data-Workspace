import os
from helpers import arc_utils as autils, arc_vars as avars, arc_sql as asql, arc_statements as astmts

import google.generativeai as genai

# gemini chat
def enhance_analysis_action_user_message(message: str, tenant_id: str, current_table_name: str) -> str:
    
    try:
        # [{columnName: 'name', dataType: 'string', isRelationship: False, relatedTable: None}]
        columns_response_data = asql.execute_raw_query(tenant=tenant_id, queries=astmts.get_complete_table_columns_query(current_table_name))
        columns_response_data = autils.cast_datatype_to_python(columns_response_data)
        for i in range(len(columns_response_data)):
            if columns_response_data[i]['isRelationship']:
                columns_response_data[i]['columnName'] = f"{columns_response_data[i]['relatedTable']}__{columns_response_data[i]['columnName']}"
        
        base_enhacement_message = avars.ANALYSIS_COPILOT_USER_MESSAGE_ENHANCEMENT
        base_enhacement_message += f"The current table the user is looking at has the table_name: {current_table_name}\n"
        base_enhacement_message += f"This is the columns information for the table {current_table_name}: {columns_response_data}\n"
        base_enhacement_message += f"If the column comes from a different table that is related to {current_table_name} table, them the 'isRelationship' will be True.\n"
        base_enhacement_message += f"The tenant_id of the user is: {tenant_id}\n"
        base_enhacement_message += f"The user has asked the following question: {message}\n"

        print('base_enhacement_message', base_enhacement_message)
        return base_enhacement_message
    except Exception as e:
        return str(e)

def send_analysis_action_message(history: list['str'], message: str, tenant_id: str, table_name) -> str:
    genai.configure(api_key=os.environ.get("GOOGLE_AI_API_KEY"))
    final_message = enhance_analysis_action_user_message(message, tenant_id, table_name)

    try:
        model = genai.GenerativeModel(
            os.environ.get("GEMINI_AI_MODEL"),
            tools=[
                genai.protos.Tool(avars.FUNCTION_DECLARATIONS)
            ],
            system_instruction=avars.ANALYSIS_COPILOT_SYSTEM_INSTRUCTIONS,
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
    """
    Parses the structured command from gemini function call response input to extract function name and arguments.

    Parameters:
        command (function_call): Command in the given structured format.

    Returns:
        dict: A dictionary with 'name' and 'args' suitable for function execution.
    """
    function_name = command.name
    args_dict = {}

    # Loop through each field and extract the key and value
    for k, v in command.args.items():
        args_dict[k] = v

    return {'name': function_name, 'args': args_dict}

def execute_function(command: genai.protos.FunctionCall):
    """
    Executes a function based on a parsed command dictionary.

    Parameters:
        command (dict): A dictionary containing the function name and its arguments, parsed from structured input.

    Returns:
        The result of the function execution or an error message if something goes wrong.
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



#  ----- database -----
def get_descriptive_analytics_for_table(
        tenant_id: str, table_name: str, filter_column: str=None, filter_value: str | float=None, 
        filter_operator: str=None, arithmetic_column: str=None, 
        arithmetic_operator: str=None
    ):
    print('args', tenant_id, table_name, filter_column, filter_value, filter_operator, arithmetic_column, arithmetic_operator)

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


if __name__ == '__main__':
    pass