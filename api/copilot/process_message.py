from helpers import arc_utils as autils, arc_vars as avars, arc_sql as asql, arc_statements as astmts

import google.generativeai as genai

def enhance_analysis_action_user_message(message: str, tenant_id: str, current_table_name: str) -> str:
    try:
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

        return base_enhacement_message
    except Exception as e:
        return str(e)
    
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

        return base_enhacement_message
    except Exception as e:
        return str(e)
    
def enhance_extraction_action_user_message(message: str, tenant_id: str, current_process_name: str):
    try:
        base_enhacement_message = avars.EXTRACTION_COPILOT_USER_MESSAGE_ENHANCEMENT

        # get process description
        process_description_response_data = asql.execute_raw_query(
            tenant=tenant_id, 
            queries=[(
                f"SELECT * FROM `{avars.PROCESSES_TABLE_NAME}` WHERE `processName` = %s;",
                [current_process_name]
            )]
        )
        process_description = process_description_response_data[0]['processDescription']
        
        # get tables for the process
        process_table_response_data = asql.execute_raw_query(
            tenant=tenant_id, 
            queries=([(
                "SELECT * FROM `process__table` WHERE `processName` = %s;",
                [current_process_name]
            )])
        )
        tables = []
        for response_data_item in process_table_response_data:
            tables += [v for k, v in response_data_item.items() if k == 'tableName']
        base_enhacement_message += f"This is a list of table_name of tables that are part of this process: {tables}\n"

        for table in tables:
            columns_response_data = asql.execute_raw_query(tenant=tenant_id, queries=astmts.get_complete_table_columns_query(table))
            columns_response_data = autils.cast_datatype_to_python(columns_response_data)
            relevant_columns = []
            for i in range(len(columns_response_data)):
                if not columns_response_data[i]['isRelationship']:
                    # current implementation does not support relationships
                    relevant_columns.append({'columnName': columns_response_data[i]['columnName'], 'dataType': columns_response_data[i]['dataType']})
            base_enhacement_message += f"The table {table} has the following columns: {relevant_columns}\n"
        
        base_enhacement_message += f"The current process the user is looking at has the process_name: {current_process_name}\n"
        base_enhacement_message += f"The current process the user is looking at has the description: {process_description}\n"
        base_enhacement_message += f"The tenant_id of the user is: {tenant_id}\n"
        base_enhacement_message += f"The user has asked you the following question: {message}\n"

        # print('base_enhacement_message', base_enhacement_message)
        return base_enhacement_message
    except Exception as e:
        print(e)
        return str(e)