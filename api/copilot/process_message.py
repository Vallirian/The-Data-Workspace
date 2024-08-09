from helpers import arc_utils as autils, arc_vars as avars, arc_sql as asql, arc_statements as astmts

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
        base_enhacement_message += f"If the column comes from a different table that is related to  the current table, them the column name will have a double dash or '__' in it. The value before the double dash or '__' is the related table name, and the value after is the column name from that related table\n"
        base_enhacement_message += f"The tenant_id of the user is: {tenant_id}\n"
        base_enhacement_message += f"The user has asked the following question: {message}\n"

        return base_enhacement_message
    except Exception as e:
        raise 'Error while processing the user message'
    
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

        columns = {k: [] for k in tables}
        for table in tables:
            columns_response_data = asql.execute_raw_query(tenant=tenant_id, queries=astmts.get_complete_table_columns_query(table))
            columns_response_data = autils.cast_datatype_to_python(columns_response_data)
            for i in range(len(columns_response_data)):
                if columns_response_data[i]['isRelationship']:
                    columns_response_data[i]['columnName'] = f"{columns_response_data[i]['relatedTable']}__{columns_response_data[i]['columnName']}"
                columns[table].append({'columnName': columns_response_data[i]['columnName'], 'dataType': columns_response_data[i]['dataType']})
            base_enhacement_message += f"The table {table} has the following columns: {columns}\n"
        
        base_enhacement_message += f"The current process the user is looking at has the process_name: {current_process_name}\n"
        base_enhacement_message += f"The current process the user is looking at has the description: {process_description}\n"
        base_enhacement_message += f"If the column comes from a different table that is related to  the current table, them the column name will have a double dash or '__' in it. The value before the double dash or '__' is the related table name, and the value after is the column name from that related table\n"
        base_enhacement_message += f"The tenant_id of the user is: {tenant_id}\n"
        base_enhacement_message += f"The user has asked the following question: {message}\n"

        return base_enhacement_message
    except Exception as e:
        raise 'Error while processing the user message'
    
def enhance_how_to_user_message(message: str, tenant_id: str):
    try:
        base_enhacement_message = avars.HOW_TO_COPILOT_USER_MESSAGE_ENHANCEMENT

        # get process description
        all_tables = set()
        all_process_response_data = asql.execute_raw_query(
            tenant=tenant_id, 
            queries=[(f"SELECT * FROM `{avars.PROCESSES_TABLE_NAME}`;",[])])
        all_process_table_response_data = asql.execute_raw_query(
            tenant=tenant_id, 
            queries=[(f"SELECT * FROM `{avars.PROCESS_TABLE_RELATIONSHIP_TABLE_NAME}`;",[])])
        
        print('all_process_response_data:', all_process_table_response_data)
        processes = {}
        for process in all_process_response_data:
            processes[process['processName']] = {
                'processDescription': process['processDescription'],
                'tables': []
            }
        print('process:', processes)
        for process_table in all_process_table_response_data:
            if processes.get(process_table['processName']) is not None:  # check if the process exists, avoid mismatch
                processes[process_table['processName']]['tables'].append(process_table['tableName'])
                all_tables.add(process_table['tableName'])
            
        print('process_table:', process_table)

        # get column information
        columns = {k: [] for k in all_tables}
        for table in all_tables:
            columns_response_data = asql.execute_raw_query(tenant=tenant_id, queries=astmts.get_complete_table_columns_query(table))
            columns_response_data = autils.cast_datatype_to_python(columns_response_data)
            for i in range(len(columns_response_data)):
                if columns_response_data[i]['isRelationship']:
                    columns_response_data[i]['columnName'] = f"{columns_response_data[i]['relatedTable']}__{columns_response_data[i]['columnName']}"
                columns[table].append({'columnName': columns_response_data[i]['columnName'], 'dataType': columns_response_data[i]['dataType']})


        base_enhacement_message += f"These are the processes available for the team and their tables: {process}\n"
        base_enhacement_message += f"These are the columns information for all tables: {columns}\n"
        base_enhacement_message += f"If the column comes from a different table that is related to  the current table, them the column name will have a double dash or '__' in it. The value before the double dash or '__' is the related table name, and the value after is the column name from that related table\n"
        base_enhacement_message += f"The tenant_id of the user is: {tenant_id}\n"
        base_enhacement_message += f"The user has asked you the following question: {message}\n"

        return base_enhacement_message
    except Exception as e:
        print('error in enhance_how_to_user_message:', e)
        raise 'Error while processing the user message'