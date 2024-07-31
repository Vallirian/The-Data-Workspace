import os
from typing import List, Dict
from django.db import connection
from helpers import arc_utils as autils, arc_vars as avars, arc_sql as asql

import google.generativeai as genai


# database
def get_info_about_all_available_tables(tenant_id: str) -> list['str']:
    """Get a list of all available tables in the database.

    Args:
        tenant_id (str): The tenant ID. Used to ensure data isolation.

    Returns:
        A list of all available tables in the database.
    """
    print('tenant_id in get_info_about_all_available_tables', tenant_id)
    response_data = asql.execute_raw_query(tenant=tenant_id, queries=[("SHOW TABLES;", [])])
    tables = []
    for response_data_item in response_data:
        tables += [v for k, v in response_data_item.items() if v not in avars.INTERNAL_TABLES]
    print('tables', tables)
    return tables

def get_info_about_all_columns_for_table(tenant_id: str, table_name: str) -> list['dict']:
    """Get a list of column informations for a specific table.

    Args:
        tenant_id (str): The tenant ID. Used to ensure data isolation.
        table_name (str): The name of the table.

    Returns:
        A list of column informations for the specified table. Each column information is a dictionary
        containing the following keys: id, Type, Null, Key, Default, Extra. If there is "__id" in the column name,
        that column holds the id of the related table. The realted table name is the part before the "__id".
    """
    print('table_name in get_info_about_all_columns_for_table', table_name)
    response_data = asql.execute_raw_query(tenant=tenant_id, queries=[(f"DESCRIBE `{table_name}`;", [])])
    columns = []
    for response_data_item in response_data:
        columns += [response_data_item]
    print('columns', columns)
    return columns

def get_data_in_table_for_all_columns(tenant_id: str, table_name: str) -> list['dict']:
    """Get all data in a table.

    Args:
        tenant_id (str): The tenant ID. Used to ensure data isolation.
        table_name (str): The name of the table.

    Returns:
        A list of dictionaries where each dictionary represents a row in the table.
    """
    print('table_name in get_data_in_table_for_all_columns', table_name)
    response_data = asql.execute_raw_query(tenant=tenant_id, queries=[(f"SELECT * FROM `{table_name}`;", [])])
    print('response_data', response_data)
    return response_data

def get_data_in_table_for_specific_columns(tenant_id: str, table_name: str, columns: list['str']) -> list['dict']:
    """Get data in a table for specific columns.
    
    Args:
        tenant_id (str): The tenant ID. Used to ensure data isolation.
        table_name (str): The name of the table.
        columns (list[str]): The columns to retrieve data for.

    Returns:
        A list of dictionaries where each dictionary represents a row in the table. Each dictionary contains
        only the specified columns.
    """
    print('table_name in get_data_in_table_for_specific_columns', table_name)
    columns_str = ', '.join(columns)
    response_data = asql.execute_raw_query(tenant=tenant_id, queries=[(f"SELECT {columns_str} FROM `{table_name}`;", [])])
    print('response_data', response_data)
    return response_data


# utilities
def count_rows():
    pass

def sum_numbers():
    pass

def average_numbers():
    pass

# gemini chat
def enhance_analysis_user_message(message: str, tenant_id: str, current_table_name) -> str:
    base_enhacement_message = avars.ANALYSIS_COPILOT_USER_MESSAGE_ENHANCEMENT
    if current_table_name:
        base_enhacement_message += f"The current table the user is looking at has the table_name: {current_table_name}"
    base_enhacement_message += f"The tenant_id of the user is: {tenant_id}"

    final_message = base_enhacement_message + '\n' + message
    return final_message

def send_analysis_message(history: list['str'], message: str, tenant_id: str, table_name) -> str:
    genai.configure(api_key=os.environ.get("GOOGLE_AI_API_KEY"))
    # generation_config = genai.GenerationConfig(
    #     temperature=0.7
    # )
    model = genai.GenerativeModel(
        os.environ.get("GEMINI_AI_MODEL"),
        tools=[get_info_about_all_available_tables, get_info_about_all_columns_for_table, get_data_in_table_for_all_columns, 
               get_data_in_table_for_specific_columns],
        system_instruction=avars.ANALYSIS_COPILOT_SYSTEM_INSTRUCTIONS,
    )
    
    gemini_chat = model.start_chat(
        history=history, 
        enable_automatic_function_calling=True
    )

    final_message = enhance_analysis_user_message(message, tenant_id, table_name)
    print('final_message', final_message)
    model_response = gemini_chat.send_message(final_message)
    print('model_response', model_response)
    return model_response.text
