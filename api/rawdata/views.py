import uuid
from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from helpers import arc_vars as avars, arc_utils as autils
from rawdata.raw_data_helpers import get_column_ids

class RawDataView(APIView):
    def get(self, request, table_id):
        column_ids = get_column_ids(table_id)

        column_query = ''
        for k, v in column_ids.items():
            for col_id in v:
                column_query += f'{autils.get_column_name(col_id)}, '
            if k != table_id:
                column_query += f'{autils.rp_get_right_table_name(k)}, '
        column_query = column_query[:-2]

        join_query = ''
        for k, v in column_ids.items():
            if k == table_id:
                continue
            join_query += f"""
                LEFT JOIN {autils.get_table_name(k)} ON {autils.get_table_name(table_id)}.{autils.rp_get_right_table_name(k)} = {autils.get_table_name(k)}.id
            """
        
        try:
            with connection.cursor() as cursor:
                query = f"""
                    SELECT {autils.get_table_name(table_id)}.id AS id, {column_query}
                    FROM {autils.get_table_name(table_id)}
                    {join_query}
                """
                cursor.execute(query)

                # Extract column headers
                columns = [col[0] for col in cursor.description]

                # Fetch all rows from cursor
                rows = cursor.fetchall()
                
                # Map rows with columns to dictionaries
                response_data = [dict(zip(columns, row)) for row in rows]
                print(query)
                return Response(response_data)
        except Exception as e:
            print(e)
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def put(self, request, table_id):
        table_name = autils.get_table_name(table_id)
        tenant_id = request.user.tenant.id
        try:
            with connection.cursor() as cursor:
                # add rows
                final_query = ''
                added_rows = request.data["added"]
                print(added_rows)
                
                for row in added_rows:
                    # added columns
                    insert_into_var = f'INSERT INTO {table_name} (id, tenant_id, '
                    values_var = f"VALUES ('{autils.remove_uuid_dash(uuid.uuid4())}', '{autils.remove_uuid_dash(tenant_id)}',"
                    for _, column_changes in row.items():
                        for col_id, col_val in column_changes.items():
                            insert_into_var += f'{col_id}, '
                            values_var += f'\'{col_val}\', '
                    insert_into_var = insert_into_var[:-2] + ')'
                    values_var = values_var[:-2] + ');'
                    final_query += insert_into_var + values_var

                print(final_query)
                cursor.execute(final_query)
                return Response("Successfully added data", status=status.HTTP_201_CREATED)
        except Exception as e:
            print(e)
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)