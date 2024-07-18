from django.db import connection
from helpers import table_helperrs

def create_raw_table(table_id):
    table_name = f"raw_table_{table_helperrs.clean_uuid(table_id)}"
    try:
        with connection.cursor() as cursor:
            query = f'''
                CREATE TABLE {table_name} (
                    tenant_id {table_helperrs.data_type_map['UUID']} NOT NULL
                );
            '''
            cursor.execute(query)
    except Exception as e:
        raise e
    
def get_raw_table(table_id):
    table_name = f"raw_table_{table_helperrs.clean_uuid(table_id)}"
    try:
        with connection.cursor() as cursor:
            query = f'''
                SELECT * FROM {table_name};
            '''
            cursor.execute(query)
            return cursor.fetchall()
    except Exception as e:
        raise e