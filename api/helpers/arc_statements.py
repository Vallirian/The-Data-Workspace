from datetime import datetime
from helpers import arc_vars as avars, arc_utils as autils, arc_sql as asql, arc_dtypes as adtypes

# Raw data tables
def get_create_raw_table_query(table_name) -> list[tuple[str, list]]:
    query = f"""
        CREATE TABLE `{table_name}` (
            `id` {avars.DATA_TYPE_MAP['UUID']} NOT NULL PRIMARY KEY,
            `updatedAt` {avars.DATA_TYPE_MAP['datetime']}
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    """
    return [(query, [])]

def get_drop_table_query(table_name) -> list[tuple[str, list]]:
    # delete process table relationship
    query = f"""
        DELETE FROM `{avars.PROCESS_TABLE_RELATIONSHIP_TABLE_NAME}`
        WHERE tableName = '{table_name}';
    """
    queries = [(query, [])]

    # delete column table entries
    query = f"""
        DELETE FROM `{avars.COLUMN_TABLE}`
        WHERE tableName = '{table_name}';
    """
    queries.append((query, []))

    # drop table
    query = f"""
        DROP TABLE `{table_name}`;
    """
    queries.append((query, []))

    return queries

def get_add_column_query(column_name, table_name, is_relationship, related_table, data_type, tenant_id) -> list[tuple[str, list]]:
    if is_relationship:
        query = []
        existing_columns = asql.execute_raw_query(tenant=tenant_id, queries=[(f"""DESCRIBE `{table_name}`;""" , [])])
        
        relationship_column_already_exists = False
        for column in existing_columns:
            if column['Field'] == f"{related_table}__id":
                relationship_column_already_exists = True
                break
        if not relationship_column_already_exists:
            query = [(f'''
                ALTER TABLE `{table_name}`
                    ADD COLUMN `{related_table}__id` {avars.DATA_TYPE_MAP['UUID']};
            ''' , [])]
    else:
        query = [(f'''
            ALTER TABLE `{table_name}`
                ADD COLUMN `{column_name}` {avars.DATA_TYPE_MAP[data_type]};
        ''' , [])]
    return query + get_add_column_to_column_table_query(column_name, table_name, is_relationship, related_table, data_type)

def get_delete_column_query(column_name, table_name, tenant_id) -> list[tuple[str, list]]:
    queries = []
    existing_columns = asql.execute_raw_query(tenant=tenant_id, queries=[(f"""DESCRIBE `{table_name}`;""" , [])])

    # drop column from table
    for column in existing_columns:
        if column['Field'] == column_name:
            queries.append((f'''
                ALTER TABLE `{table_name}`
                    DROP COLUMN `{column_name}`;
            ''' , []))
            break

    # delete column from column table
    queries.append((f'''
        DELETE FROM `{avars.COLUMN_TABLE}`
        WHERE columnName = '{column_name}' AND tableName = '{table_name}';
    ''' , []))

    return queries
          

def get_add_column_to_column_table_query(column_name, table_name, is_relationship, related_table, data_type) -> list[tuple[str, list]]:
    current_timestamp = adtypes.get_current_datetime()
    is_relationship = 1 if is_relationship else 0
    related_table = related_table if is_relationship else None
    
    query = [(f"""
        INSERT INTO `{avars.COLUMN_TABLE}` (id, columnName, dataType, tableName, updatedAt, isRelationship, relatedTable) 
            VALUES (%s, %s, %s, %s, %s, %s, %s);
    """, [autils.custom_uuid(), column_name, data_type, table_name, current_timestamp, is_relationship, related_table])]

    return query

def get_complete_table_columns_query(table_name) -> list[tuple[str, list]]:
    query = f"SELECT * FROM `{avars.COLUMN_TABLE}` WHERE tableName = '{table_name}';"
    return [(query, [])]

def get_column_table_by_column_name_query(table_name, column_name) -> list[tuple[str, list]]:
    query = f"SELECT * FROM `{avars.COLUMN_TABLE}` WHERE columnName = '{column_name}' AND tableName = '{table_name}';"
    return [(query, [])]

def get_complete_table_query(tenant_id, table_name) -> list[tuple[str, list]]:
    """
    Get query for fetching all columns of a table including relationships.
    """
    table_columns = asql.execute_raw_query(tenant=tenant_id, queries=get_complete_table_columns_query(table_name))

    column_query = ''
    for col in table_columns:
        if col["isRelationship"]:
            column_query += f'`{col["relatedTable"]}`.`{col["columnName"]}` AS `{col["relatedTable"]}__{col["columnName"]}`, ' if f'{col["relatedTable"]}.{col["columnName"]}, ' not in column_query else ''
        else:
            column_query += f'`{col["columnName"]}`, ' if f'{col["columnName"]}, ' not in column_query else ''
    column_query = column_query[:-2]

    join_query = ''
    for col in table_columns:
        if col["isRelationship"]:
            temp_query = f'LEFT JOIN `{col["relatedTable"]}` ON `{table_name}`.`{col["relatedTable"]}__id` = `{col["relatedTable"]}`.`id` '
            join_query += temp_query if temp_query not in join_query else ''

    query = f"SELECT `{table_name}`.`id` AS `id`, `{table_name}`.`updatedAt` AS `updatedAt`, {column_query} "
    query = query.strip()
    if query[-1] == ',': 
        # for cases where column_query is empty
        query = query[:-1]

    query += f"""
        FROM `{table_name}`
        {join_query}
    """
    query += f'ORDER BY `{table_name}`.`updatedAt` DESC;'

    return [(query, [])]

# Copilot tables
def get_create_new_chat_query(chat_id, display_name, user_id) -> list[tuple[str, list]]:
    current_timestamp = adtypes.get_current_datetime()
    query = [(f"""
        INSERT INTO `{avars.COPILOT_CHAT_TABLE_NAME}` (id, createdAt, displayName, userId)
            VALUES (%s, %s, %s, %s);
    """ , [chat_id, current_timestamp, display_name, user_id])]
    return query

def get_create_new_message_query(message, chat_id, user_type, user_id) -> list[tuple[str, list]]:
    current_timestamp = adtypes.get_current_datetime()
    query = [(f"""
        INSERT INTO `{avars.COPILOT_MESSAGE_TABLE_NAME}` (id, createdAt, message, chatId, userType, userId)
            VALUES (%s, %s, %s, %s, %s, %s);
    """ , [autils.custom_uuid(), current_timestamp, message, chat_id, user_type, user_id])]
    return query

# Process tables
def get_create_new_process_query(process_name, process_description) -> list[tuple[str, list]]:
    current_timestamp = adtypes.get_current_datetime()
    query = [(f"""
        INSERT INTO `{avars.PROCESSES_TABLE_NAME}` (processName, processDescription, createdAt)
            VALUES (%s, %s, %s);
    """ , [process_name, process_description, current_timestamp])]
    return query

def get_delete_process_query(process_name) -> list[tuple[str, list]]:
    query =[( f"""
        DELETE FROM `{avars.PROCESSES_TABLE_NAME}`
        WHERE processName = %s;
    """, [process_name])]

    query.append((f"""
        DELETE FROM `{avars.PROCESS_TABLE_RELATIONSHIP_TABLE_NAME}`
        WHERE processName = %s;
    """, [process_name]))

    

    return query

def get_create_new_process_table_relationship_query(process_name: str, table_names: list['str']) -> list[tuple[str, list]]:
    current_timestamp = adtypes.get_current_datetime()
    query = []
    for table_name in table_names:
        query.append((f"""
            INSERT INTO `{avars.PROCESS_TABLE_RELATIONSHIP_TABLE_NAME}` (id, processName, tableName, createdAt)
            VALUES (%s, %s, %s, %s);
        """, [autils.custom_uuid(), process_name, table_name, current_timestamp]))
    return query

def get_delete_process_table_relationship_query(process_name: str, table_names: str) -> list[tuple[str, list]]:
    query = []
    for table_name in table_names:
        query.append((f"""
            DELETE FROM `{avars.PROCESS_TABLE_RELATIONSHIP_TABLE_NAME}`
            WHERE processName = %s AND tableName = '{table_name}';
        """, [process_name]))
    return query

# support tables
def get_supporting_tables_query() -> list[tuple[str, list]]:
    """
    Return:
        list[tuple[str, str]]: List of queries to create supporting tables. Each query is a tuple of the query and the query parameters.
    """
    queries = []

    # Create the column table
    col_table_query= f"""
        CREATE TABLE IF NOT EXISTS `{avars.COLUMN_TABLE}` (
            id {avars.DATA_TYPE_MAP['UUID']} NOT NULL PRIMARY KEY,
            columnName {avars.DATA_TYPE_MAP['string']} NOT NULL,
            dataType {avars.DATA_TYPE_MAP['string']} NOT NULL,
            tableName {avars.DATA_TYPE_MAP['string']} NOT NULL,
            updatedAt {avars.DATA_TYPE_MAP['datetime']} NOT NULL,
            isRelationship {avars.DATA_TYPE_MAP['boolean']} NOT NULL,
            relatedTable {avars.DATA_TYPE_MAP['string']}
        );
    """
    queries.append((col_table_query, []))

    # Create the copilot chat table
    copilot_chat_uery = f"""
        CREATE TABLE IF NOT EXISTS  `{avars.COPILOT_CHAT_TABLE_NAME}` (
            id {avars.DATA_TYPE_MAP['UUID']} NOT NULL PRIMARY KEY,
            createdAt {avars.DATA_TYPE_MAP['datetime']} NOT NULL,
            displayName {avars.DATA_TYPE_MAP['string']} NOT NULL,
            userId {avars.DATA_TYPE_MAP['UUID']} NOT NULL
        );
    """
    queries.append((copilot_chat_uery, []))

    # Create the copilot message table
    copilot_message_query = f"""
        CREATE TABLE IF NOT EXISTS `{avars.COPILOT_MESSAGE_TABLE_NAME}` (
            id {avars.DATA_TYPE_MAP['UUID']} NOT NULL PRIMARY KEY,
            createdAt {avars.DATA_TYPE_MAP['datetime']} NOT NULL,
            message {avars.DATA_TYPE_MAP['string']} NOT NULL,
            chatId {avars.DATA_TYPE_MAP['UUID']} NOT NULL,
            userType {avars.DATA_TYPE_MAP['string']} NOT NULL,
            userId {avars.DATA_TYPE_MAP['UUID']} NOT NULL
        );
    """
    queries.append((copilot_message_query, []))

    # Create processes table
    processes_query = f"""
        CREATE TABLE IF NOT EXISTS `{avars.PROCESSES_TABLE_NAME}` (
            processName {avars.DATA_TYPE_MAP['UUID']} NOT NULL PRIMARY KEY,
            processDescription {avars.DATA_TYPE_MAP['string']},
            createdAt {avars.DATA_TYPE_MAP['datetime']} NOT NULL
        );
    """
    queries.append((processes_query, []))

    process_table_relationship_query = f"""
        CREATE TABLE IF NOT EXISTS `{avars.PROCESS_TABLE_RELATIONSHIP_TABLE_NAME}` (
            id {avars.DATA_TYPE_MAP['UUID']} NOT NULL PRIMARY KEY,
            processName {avars.DATA_TYPE_MAP['UUID']} NOT NULL,
            tableName {avars.DATA_TYPE_MAP['string']} NOT NULL,
            createdAt {avars.DATA_TYPE_MAP['datetime']} NOT NULL
        );
    """
    queries.append((process_table_relationship_query, []))

    return queries