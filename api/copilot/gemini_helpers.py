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
    response_data = asql.execute_raw_query(tenant=tenant_id, query="SHOW TABLES;")
    tables = []
    for response_data_item in response_data:
        tables += [v for k, v in response_data_item.items() if v not in avars.INTERNAL_TABLES]
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
    response_data = asql.execute_raw_query(tenant=tenant_id, query=f"DESCRIBE `{table_name}`;")
    columns = []
    for response_data_item in response_data:
        columns += [response_data_item]
    return columns

def get_data_in_table_for_all_columns(tenant_id: str, table_name: str) -> list['dict']:
    """Get all data in a table.

    Args:
        tenant_id (str): The tenant ID. Used to ensure data isolation.
        table_name (str): The name of the table.

    Returns:
        A list of dictionaries where each dictionary represents a row in the table.
    """
    response_data = asql.execute_raw_query(tenant=tenant_id, query=f"SELECT * FROM `{table_name}`;")
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
    columns_str = ', '.join(columns)
    response_data = asql.execute_raw_query(tenant=tenant_id, query=f"SELECT {columns_str} FROM `{table_name}`;")
    return response_data


# utilities
def count_rows():
    pass

def sum_numbers():
    pass

def average_numbers():
    pass

# gemini chat
def enhance_analysis_user_message(message: str, tenant_id: str, current_table_name=None) -> str:
    base_enhacement_message = avars.ANALYSIS_COPILOT_USER_MESSAGE_ENHANCEMENT
    if current_table_name:
        base_enhacement_message += f"The current table the user is looking at has the table_name: {current_table_name}"
    base_enhacement_message += f"The tenant_id of the user is: {tenant_id}"

    final_message = base_enhacement_message + '\n' + message
    return final_message

def send_analysis_message(history: list['str'], message: str, tenant_id: str, table_name=None) -> str:
    genai.configure(api_key=os.environ.get("GOOGLE_AI_API_KEY"))
    model = genai.GenerativeModel(
        os.environ.get("GEMINI_AI_MODEL"),
        tools=[get_info_about_all_available_tables, get_info_about_all_columns_for_table, get_data_in_table_for_all_columns, 
               get_data_in_table_for_specific_columns],
        system_instruction=avars.ANALYSIS_COPILOT_SYSTEM_INSTRUCTIONS,
        temprature=0.1
    )
    gemini_chat = model.start_chat(
        history=history, 
        enable_automatic_function_calling=True
    )
    print(message)
    model_response = gemini_chat.send_message(enhance_analysis_user_message(message, tenant_id, table_name))
    print(model_response)
    print(model_response.text)
    return model_response.text
