from datetime import datetime
from helpers import arc_vars as avars, arc_utils as autils, arc_sql as asql

def get_create_raw_table_query(table_name):
    query = f"""
        CREATE TABLE `{table_name}` (
            id {avars.data_type_map['UUID']} NOT NULL PRIMARY KEY,
            updatedAt {avars.data_type_map['datetime']}
        );
    """
    return query

def get_add_column_query(column_name, table_name, is_relationship, related_table, data_type, tenant_id):
    if is_relationship:
        query = ""
        existing_columns = asql.execute_raw_query(tenant=tenant_id, query=f"""DESCRIBE `{table_name}`;""")
        
        relationship_column_already_exists = False
        for column in existing_columns:
            if column['Field'] == f"{related_table}__id":
                relationship_column_already_exists = True
                break
        if not relationship_column_already_exists:
            query = f'''
                ALTER TABLE `{table_name}`
                    ADD COLUMN `{related_table}__id` {avars.data_type_map['UUID']};
            '''
    else:
        query = f'''
            ALTER TABLE `{table_name}`
                ADD COLUMN `{column_name}` {avars.data_type_map[data_type]};
        '''
    return query + get_add_column_to_column_table_query(column_name, table_name, is_relationship, related_table, data_type)

def get_add_column_to_column_table_query(column_name, table_name, is_relationship, related_table, data_type):
    current_timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    is_relationship = 1 if is_relationship else 0
    related_table = f"'{related_table}'" if is_relationship else "''"
    query = f"""
        INSERT INTO `{avars.column_table}` (id, columnName, dataType, tableName, updatedAt, isRelationship, relatedTable) 
            VALUES ('{autils.custom_uuid()}', '{column_name}', '{data_type}', '{table_name}', '{current_timestamp}', '{is_relationship}', {related_table});
    """

    return query

def get_create_new_chat_query(chat_id, display_name, user_id):
    current_timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    query = f"""
        INSERT INTO `{avars.COPILOT_CHAT_TABLE_NAME}` (id, createdAt, displayName, userId)
            VALUES ('{chat_id}', '{current_timestamp}', '{display_name}', '{user_id}');
    """
    return query

def get_create_new_message_query(message, chat_id, user_type, user_id):
    current_timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    query = f"""
        INSERT INTO `{avars.COPILOT_MESSAGE_TABLE_NAME}` (id, createdAt, message, chatId, userType, userId)
            VALUES ('{autils.custom_uuid()}', '{current_timestamp}', '{message}', '{chat_id}', '{user_type}', '{user_id}');
    """
    return query
    
def get_supporting_tables_query():
    query = ""

    # Create the column table
    query += f"""
        CREATE TABLE IF NOT EXISTS `{avars.column_table}` (
            id {avars.data_type_map['UUID']} NOT NULL PRIMARY KEY,
            columnName {avars.data_type_map['string']} NOT NULL,
            dataType {avars.data_type_map['string']} NOT NULL,
            tableName {avars.data_type_map['string']} NOT NULL,
            updatedAt {avars.data_type_map['datetime']} NOT NULL,
            isRelationship {avars.data_type_map['boolean']} NOT NULL,
            relatedTable {avars.data_type_map['string']}
        );
    """

    # Create the copilot chat table
    query += f"""
        CREATE TABLE IF NOT EXISTS  `{avars.COPILOT_CHAT_TABLE_NAME}` (
            id {avars.data_type_map['UUID']} NOT NULL PRIMARY KEY,
            createdAt {avars.data_type_map['datetime']} NOT NULL,
            displayName {avars.data_type_map['string']} NOT NULL,
            userId {avars.data_type_map['UUID']} NOT NULL
        );
    """
    # Create the copilot message table
    query += f"""
        CREATE TABLE IF NOT EXISTS `{avars.COPILOT_MESSAGE_TABLE_NAME}` (
            id {avars.data_type_map['UUID']} NOT NULL PRIMARY KEY,
            createdAt {avars.data_type_map['datetime']} NOT NULL,
            message {avars.data_type_map['string']} NOT NULL,
            chatId {avars.data_type_map['UUID']} NOT NULL,
            userType {avars.data_type_map['string']} NOT NULL,
            userId {avars.data_type_map['UUID']} NOT NULL
        );
    """
    return query