from datetime import datetime
from helpers import arc_vars as avars, arc_utils as autils, arc_sql as asql

def get_create_raw_table_query(table_name):
    query = f"""
        CREATE TABLE `{table_name}` (
            id {avars.data_type_map['UUID']} NOT NULL PRIMARY KEY,
            updatedAt {avars.data_type_map['datetime']}
        );
    """
    return get_create_column_table_query() + query

def get_add_column_query(column_name, table_name, is_relationship, related_table, data_type, tenant_id):
    if is_relationship:
        query = ""
        existing_columns = asql.execute_raw_query(tenant=tenant_id, 
                                                  query=f"""
                                                  SELECT * FROM {avars.column_table} 
                                                  WHERE tableName = '{table_name}' 
                                                        AND isRelationship = 1
                                                        AND relatedTable = '{related_table}';
                                                """)
        if len(existing_columns) == 0:
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

def get_create_column_table_query():
    """
    Creates the supporting tables for the specified tenant.
    :param tenant: The schema name to use.
    """
    query = f"""
        CREATE TABLE IF NOT EXISTS `column__column` (
            id {avars.data_type_map['UUID']} NOT NULL PRIMARY KEY,
            columnName {avars.data_type_map['string']} NOT NULL,
            dataType {avars.data_type_map['string']} NOT NULL,
            tableName {avars.data_type_map['string']} NOT NULL,
            updatedAt {avars.data_type_map['datetime']} NOT NULL,
            isRelationship {avars.data_type_map['boolean']} NOT NULL,
            relatedTable {avars.data_type_map['string']}
        );
    """
    return query

def get_add_column_to_column_table_query(column_name, table_name, is_relationship, related_table, data_type):
    current_timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    is_relationship = 1 if is_relationship else 0
    related_table = f"'{related_table}'" if is_relationship else "''"
    query = f"""
        INSERT INTO `{avars.column_table}` (id, columnName, dataType, tableName, updatedAt, isRelationship, relatedTable) 
            VALUES ('{autils.custom_uuid()}', '{column_name}', '{data_type}', '{table_name}', '{current_timestamp}', '{is_relationship}', {related_table});
    """

    return query
