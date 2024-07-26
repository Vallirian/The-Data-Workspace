from datetime import datetime
from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from helpers import arc_vars as avars, arc_utils as autils
from rawdata.raw_data_helpers import get_column_ids

class RawDataView(APIView):
    def get(self, request, table_id):
        column_ids = get_column_ids(table_id)

        # limit the columns to be queried
        requested_columns = request.query_params.get("columns")
        if requested_columns:
            requested_columns = requested_columns.split(",")
            for k, v in column_ids.items():
                column_ids[k] = {col_id for col_id in v if col_id in requested_columns}

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
                query = f"SELECT {table_id}.id AS id, {table_id}.updatedAt AS updatedAt, {column_query}"
                query = query.strip()
                if query[-1] == ',': 
                    # for cases where column_query is empty
                    query = query[:-1]

                query += f"""
                    FROM {table_id}
                    {join_query}
                """
                query += f'ORDER BY {table_id}.updatedAt DESC;'
                print(query)
                cursor.execute(query)

                # Extract column headers
                columns = [col[0] for col in cursor.description]

                # Fetch all rows from cursor
                rows = cursor.fetchall()
                print(rows)
                
                # Map rows with columns to dictionaries
                response_data = [dict(zip(columns, row)) for row in rows]
                
                # if no data is found, return empty list with column headers
                if not response_data:
                    response_data = [dict(zip(columns, [None]*len(columns)))]
                print(response_data)

                return Response(response_data)
        except Exception as e:
            print(e)
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
                    current_timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    insert_into_var = f'INSERT INTO {table_id} (id, tenant_id, updatedAt, '
                    values_var = f"VALUES ('{autils.custom_uuid()}', '{tenant_id}', '{current_timestamp}', "
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