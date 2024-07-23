from django.db import connection
from helpers import table_helperrs as th

def get_column_ids(table_id):
    table_name = f"{th.raw_table_prefix}{th.clean_uuid(table_id)}"
    direct_columns = []

    with connection.cursor() as cursor:
        query = f"SELECT id FROM column_column WHERE table_id = '{th.clean_uuid(table_id)}';"
        cursor.execute(query)
        rows = cursor.fetchall()
        direct_columns += [f'{th.raw_column_prefix}{row[0]}' for row in rows]
    
    