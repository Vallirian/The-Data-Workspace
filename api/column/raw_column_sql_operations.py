from django.db import connection
from helpers import table_helperrs

def insert_new_column(table_id, column_id, data_type):
    table_name = f"raw_table_{table_helperrs.clean_uuid(table_id)}"
    column_name = f"raw_column_{table_helperrs.clean_uuid(column_id)}"
    try:
        with connection.cursor() as cursor:
            query = f'''
                ALTER TABLE {table_name}
                    ADD COLUMN {column_name} {table_helperrs.data_type_map[data_type]};
            '''
            cursor.execute(query)
    except Exception as e:
        raise e