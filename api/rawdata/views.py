import uuid
from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from helpers import table_helperrs as th
from rawdata import raw_data_helpers as rdh

class RawDataView(APIView):
    def get(self, request, table_id):
        rdh.get_column_ids(table_id)
        table_name = f"{th.raw_table_prefix}{th.clean_uuid(table_id)}"
        try:
            with connection.cursor() as cursor:
                query = f"SELECT * FROM {table_name};"
                cursor.execute(query)

                # Extract column headers
                columns = [col[0] for col in cursor.description]

                # Fetch all rows from cursor
                rows = cursor.fetchall()
                
                # Map rows with columns to dictionaries
                response_data = [dict(zip(columns, row)) for row in rows]
                return Response(response_data)
        except Exception as e:
            # Properly log the exception if logging is set up
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def put(self, request, table_id):
        table_name = f"{th.raw_table_prefix}{th.clean_uuid(table_id)}"
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
                    values_var = f"VALUES ('{th.clean_uuid(uuid.uuid4())}', '{th.clean_uuid(tenant_id)}',"
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