import os
from typing import List, Dict
from django.db import connection
from helpers import arc_utils as autils, arc_vars as avars

import google.generativeai as genai


def get_tables_metadata(tenant_id: str) -> List[Dict[str, str]]:
    """
    Description:
        - Get tables metadata for all tables that hold the raw/actual data. Each table metadata has display name of the table (string), its 
        id (a unique combination of letters and numbers), and description of the table (string). For each table metadata, there is a corresponding 
        raw data table with a name that is the metadata table’s id.
            - For example, let’s say this function returned this 
                [{”id”: “9dnkv5i923ndf03y7njfo99wjdo0jd7df”, “displayName”: “customers”, “description”: “customers that are served by the company”}]. 
            Then, there is a raw data table called `9dnkv5i923ndf03y7njfo99wjdo0jd7df` that has customers data.

    Args:
        - tenant_id (string): The id of the tenant, not the user. You will receive the tenant id in the instructions. This argument is used to filter out tables 
        that are for that specific tenant only.
    
    Returns:
        - List of dictionaries: Each dictionary has keys `id`, `displayName`, and `description`. The value of each key is a string.
            - Example return: [{”id”: “9dnkv5i923ndf03y7njfo99wjdo0jd7df”, “displayName”: “customers”, “description”: “customers that are served by the company”}]
    """
    print('get_tables_metadata', tenant_id)
    try:
        with connection.cursor() as cursor:
            query = f"""
                SELECT *
                FROM {avars.table_table}
                WHERE tenant_id = '{tenant_id}';
            """
            cursor.execute(query)
            rows = cursor.fetchall()

            tables_metadata = []
            for row in rows:
                table_metadata = {
                    "id": row[0],
                    "displayName": row[1],
                    "description": row[2]
                }
                tables_metadata.append(table_metadata)
            return tables_metadata
    except Exception as e:
        raise e

def get_columns_metadata(tenant_id: str, table_id: str) -> List[Dict[str, str]]:
    """
    Description:
        - Get the columns metadata for all tables that hold the actual/raw data. Each column metadata has display name (string), 
        its id (a unique combination of letters and numbers), description of what that column holds, and table id (string) which is the raw data table 
        to which that column belongs. For each column metadata, there is a column with a name that is the same as the column’s id, in a raw data table with 
        the name of the metadata column’s table id.
            - For example, lets say this function returned this 
            [{”id”: “hns9n6fh032nbd67w2gfhbd92”, “displayName”: “email”, “description”: “email of the customer”, “table_id”: “9dnkv5i923ndf03y7njfo99wjdo0jd7df”}]
            Then there is a raw data table called `9dnkv5i923ndf03y7njfo99wjdo0jd7df` with a column called `hns9n6fh032nbd67w2gfhbd92`.

    Args:
        - tenant_id (string): The id of the tenant, not the user. You will receive the tenant id in the instructions. This argument is used to filter out 
        tables that are for that specific tenant only.
        - table_id (string): The id of the table for which you want to get the columns metadata. You will receive the table id in the instructions.
    
    Returns:
        - List of dictionaries: Each dictionary has keys `id`, `displayName`, `description`, and `table_id`. The value of each key is a string.
            - Example return: [{”id”: “hns9n6fh032nbd67w2gfhbd92”, “displayName”: “email”, “description”: “email of the customer”, “table_id”: “9dnkv5i923ndf03y7njfo99wjdo0jd7df”}]
    """
    print('get_cols_metadata', tenant_id, table_id)
    try:
        with connection.cursor() as cursor:
            query = f"""
                SELECT id, displayName, description, table_id
                FROM {avars.column_table}
                WHERE tenant_id = '{tenant_id}' AND table_id = '{table_id}';
            """
            cursor.execute(query)
            rows = cursor.fetchall()

            columns_metadata = [
                {
                    "id": row[0],
                    "displayName": row[1],
                    "description": row[2],
                    "table_id": row[3]
                }
                for row in rows
            ]
            print(columns_metadata)
            return columns_metadata
    except Exception as e:
        raise e

def get_table_raw_data():
    pass

# utilities
def count_rows():
    pass

def sum_numbers():
    pass

def average_numbers():
    pass

# gemini chat
def create_system_instruction(tenant_id: str, table_id: str) -> str:
    instruction = avars.analysis_copilot_system_instruction
    instruction += f"""for this chat, you are analyzing data for tenant with tenant id: {tenant_id}.
    tenanat id is a unique identifier for a tenant in the platform. It serves as a security measure 
    to ensure that data is only accessible to the right tenant.
    The table you are analyzing is the table with id: {table_id}.
    """

    return instruction

def send_analysis_message(history: List[str], message: str, tenant_id: str, table_id: str) -> str:
    genai.configure(api_key=os.environ.get("GOOGLE_AI_API_KEY"))
    model = genai.GenerativeModel(
        os.environ.get("GEMINI_AI_MODEL"),
        tools=[get_tables_metadata, get_columns_metadata],
        system_instruction=create_system_instruction(tenant_id=tenant_id, table_id=table_id)
    )
    gemini_chat = model.start_chat(
        history=history, 
        enable_automatic_function_calling=True
    )
    print(message)
    model_response = gemini_chat.send_message(message)
    print(model_response.text)
    print(model_response)
