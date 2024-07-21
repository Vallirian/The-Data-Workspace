import uuid
from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from helpers import table_helperrs

class RawDataView(APIView):
    def get(self, request, table_id):
        table_name = f"raw_table_{table_helperrs.clean_uuid(table_id)}"
        try:
            with connection.cursor() as cursor:
                query = f'''
                    SELECT * FROM {table_name};
                '''
                cursor.execute(query)
                response_data = cursor.fetchall()
                return Response(response_data)
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def put(self, request, table_id):
        table_name = f"raw_table_{table_helperrs.clean_uuid(table_id)}"
        tenant_id = request.user.tenant.id
        try:
            with connection.cursor() as cursor:
                # add rows
                final_query = ''
                added_rows = request.data["added"]
                add_row_query = f'INSERT INTO {table_name} (id, tenant_id, '
                for row in added_rows:
                    values = f'({str(uuid.uuid4())}, {tenant_id}, '
                    for key in list(row.keys()):
                        add_row_query += f'{key}, '
                        values += f"'{row[key]}', "
                    add_row_query = add_row_query[:-2] + f') VALUES {values[:-2]});'
                    final_query += add_row_query
                print(final_query)
                cursor.execute(final_query)
                return Response("Successfully added data", status=status.HTTP_201_CREATED)
        except Exception as e:
            print(e)
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)