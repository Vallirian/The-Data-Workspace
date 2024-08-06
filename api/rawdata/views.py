from datetime import datetime
from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from helpers import arc_vars as avars, arc_utils as autils, arc_sql as asql

class RawDataView(APIView):
    def get(self, request, table_name):
        tenant_id = request.user.tenant.id
        table_columns = asql.execute_raw_query(tenant=tenant_id, queries=[(f"SELECT * FROM {avars.COLUMN_TABLE} WHERE tableName = '{table_name}';", [])])
        
        # limit the columns to be queried
        requested_columns = request.query_params.get("columns")
        if requested_columns:
            requested_columns = requested_columns.split(',')
            table_columns = [col for col in table_columns if col["columnName"] in requested_columns]

        column_query = ''
        for col in table_columns:
            if col["isRelationship"]:
                column_query += f'`{col["relatedTable"]}`.`{col["columnName"]}` AS `{col["relatedTable"]}__{col["columnName"]}`, ' if f'{col["relatedTable"]}.{col["columnName"]}, ' not in column_query else ''
            else:
                column_query += f'`{col["columnName"]}`, ' if f'{col["columnName"]}, ' not in column_query else ''
        column_query = column_query[:-2]
        
        join_query = ''
        for col in table_columns:
            if col["isRelationship"]:
                temp_query = f'LEFT JOIN `{col["relatedTable"]}` ON `{table_name}`.`{col["relatedTable"]}__id` = `{col["relatedTable"]}`.`id` '
                join_query += temp_query if temp_query not in join_query else ''

        query = f"SELECT `{table_name}`.`id` AS `id`, `{table_name}`.`updatedAt` AS `updatedAt`, {column_query} "
        query = query.strip()
        if query[-1] == ',': 
            # for cases where column_query is empty
            query = query[:-1]

        query += f"""
            FROM {table_name}
            {join_query}
        """
        query += f'ORDER BY `{table_name}`.`updatedAt` DESC;'
        
        try:
            response_data = asql.execute_raw_query(tenant=tenant_id, queries=[(query, [])])
            return Response(response_data)
        except Exception as e:
            return Response({'error': f'Unable to fetch data for table {table_name}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
    def put(self, request, table_name):
        tenant_id = request.user.tenant.id
        final_queries = []
        
        try:
            # add rows
            added_rows = request.data["added"]
            updated_rows = request.data["updated"]
            current_timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            for row in added_rows:
                columns_part = []
                values_count = 0
                params = []

                # generate uuid for the row
                row_id = autils.custom_uuid()
                columns_part.extend(['id', 'updatedAt'])
                values_count += 2
                params.extend([row_id, current_timestamp])

                for _, column_changes in row.items():
                    for col_id, col_val in column_changes.items():
                        columns_part.append(f'`{col_id}`')
                        values_count += 1
                        params.append(col_val)

                # construct the query
                final_query = f"""
                    INSERT INTO `{table_name}` ({", ".join(columns_part)}) 
                    VALUES ({", ".join(['%s' for _ in range(values_count)])});
                """
                print('final_query', final_query)

                final_queries.append((final_query, params))

            # update rows
            for row in updated_rows:
                for row_id, column_changes in row.items():
                    params = []
                    set_part = []

                    for col_id, col_val in column_changes.items():
                        set_part.append(f'`{col_id}` = %s')
                        params.append(col_val)
                    
                    params.append(row_id)
                    set_part = ', '.join(set_part)

                    # construct the query
                    final_query = f"""
                        UPDATE `{table_name}` 
                        SET {set_part}
                        WHERE `id` = %s;
                    """ # TODO: add updatedAt

                    print('final_query', final_query)
                    print('params', params)

                    final_queries.append((final_query, params))

            # delete rows
            deleted_rows = request.data["deleted"]
            for row_id in deleted_rows:
                final_query = f"""
                    DELETE FROM `{table_name}` 
                    WHERE `id` = %s;
                """
                final_queries.append((final_query, [row_id]))


            put_response_data = asql.execute_raw_query(tenant=tenant_id, queries=final_queries)
            return Response(put_response_data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)