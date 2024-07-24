from django.db import connection
from helpers import arc_utils as autils, arc_vars as avars

def get_column_ids(table_id):
    all_columns = {table_id: set()}

    try:
        with connection.cursor() as cursor:
            direc_cols_query = f"SELECT id FROM {avars.column_table} WHERE table_id = '{table_id}';"
            cursor.execute(direc_cols_query)
            rows = cursor.fetchall()
            for row in rows:
                all_columns[table_id].add(row[0])

        with connection.cursor() as cursor:
            rel_tables_query = f"""
                SELECT rightTable_id, rightTableColumn_id 
                FROM {avars.relationship_table} 
                WHERE leftTable_id = '{table_id}';
            """
            cursor.execute(rel_tables_query)
            rows = cursor.fetchall()
            for row in rows:
                if row[0] not in all_columns:
                    all_columns[row[0]] = set()
                all_columns[row[0]].add(row[1])
        
        return all_columns
    except Exception as e:
        raise e
    
def create_raw_table(table_id):
    try:
        with connection.cursor() as cursor:
            query = f'''
                CREATE TABLE {table_id} (
                    id {avars.data_type_map['UUID']} NOT NULL PRIMARY KEY,
                    tenant_id {avars.data_type_map['UUID']} NOT NULL,
                    
                );
            '''
            cursor.execute(query)
    except Exception as e:
        raise e
    
def insert_new_column(table_id, column_id, data_type):
    try:
        with connection.cursor() as cursor:
            query = f'''
                ALTER TABLE {table_id}
                    ADD COLUMN {column_id} {avars.data_type_map[data_type]};
            '''
            print(query)
            cursor.execute(query)
    except Exception as e:
        raise e
    
def add_relationship(left_table_id, right_table_id):
    try:
        with connection.cursor() as cursor:
            query = f'''
                ALTER TABLE {left_table_id}
                    ADD COLUMN {autils.rp_get_right_table_name(right_table_id)} {avars.data_type_map['UUID']};
            '''
            query += f'''
                ALTER TABLE {right_table_id}
                    ADD COLUMN {autils.rp_get_right_table_name(left_table_id)} {avars.data_type_map['UUID']};
            '''
            cursor.execute(query)
    except Exception as e:
        raise e
    
