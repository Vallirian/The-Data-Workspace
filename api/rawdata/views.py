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
                column_query += f'{col_id}, '
            if k != table_id:
                column_query += f'{autils.rp_get_right_table_name(k)}, '
        column_query = column_query[:-2]

        join_query = ''
        for k, v in column_ids.items():
            if k == table_id:
                continue
            join_query += f"""
                LEFT JOIN {k} ON {table_id}.{autils.rp_get_right_table_name(k)} = {k}.id
            """
        
        try:
            with connection.cursor() as cursor:
                query = f"""
                    SELECT {table_id}.id AS id, {column_query}
                    FROM {table_id}
                    {join_query}
                """
                cursor.execute(query)

                # Extract column headers
                columns = [col[0] for col in cursor.description]

                # Fetch all rows from cursor
                rows = cursor.fetchall()
                
                # Map rows with columns to dictionaries
                response_data = [dict(zip(columns, row)) for row in rows]
                return Response(response_data)
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def put(self, request, table_id):
        tenant_id = request.user.tenant.id
        try:
            with connection.cursor() as cursor:
                # add rows
                final_query = ''
                added_rows = request.data["added"]
                
                for row in added_rows:
                    # added columns
                    insert_into_var = f'INSERT INTO {table_id} (id, tenant_id, '
                    values_var = f"VALUES ('{autils.custom_uuid()}', '{tenant_id}',"
                    for _, column_changes in row.items():
                        for col_id, col_val in column_changes.items():
                            insert_into_var += f'{col_id}, '
                            values_var += f'\'{col_val}\', '
                    insert_into_var = insert_into_var[:-2] + ')'
                    values_var = values_var[:-2] + ');'
                    final_query += insert_into_var + values_var

                cursor.execute(final_query)
                return Response("Successfully added data", status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)