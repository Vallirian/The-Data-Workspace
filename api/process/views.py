from django.db.utils import OperationalError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from helpers import arc_vars as avars, arc_sql as asql, arc_statements as astmts, arc_validate as aval

class ProcessListView(APIView):
    def get(self, request):
        tenant_id = request.user.tenant.id

        try:
            response_data = asql.execute_raw_query(tenant=tenant_id, queries=([(f"SELECT * FROM `{avars.PROCESSES_TABLE_NAME}`  ORDER BY `createdAt`;", [])]))
            # when no processes are created yet, we need to remove the placeholder process send from asql.execute_raw_query
            if len(response_data) == 1:
                if response_data[0]['processName'] == None:
                    return Response([])
            return Response(response_data)
        except OperationalError as e:
            return Response({'error': f'Database error: operation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f'Unexpected error: failed to fetch processes'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def post(self, request):
        tenant_id = request.user.tenant.id
        process_name = request.data.get("processName")
        process_description = request.data.get("processDescription")

        if not process_name:
            return Response({'error': f'Process name is required'}, status=status.HTTP_400_BAD_REQUEST)
        table_name_valid, table_name_validation_error = aval.validate_object_name(process_name)
        if not table_name_valid:
            return Response({'error': table_name_validation_error}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Create table
            asql.execute_raw_query(tenant=tenant_id, queries=astmts.get_create_new_process_query(process_name, process_description))
            return Response(process_name, status=status.HTTP_201_CREATED)
        except OperationalError as e:
            return Response({'error': f'Database error: operation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f'Unexpected error: failed to create process'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class ProcessTableRelationshipListView(APIView):
    def get(self, request, process_name):
        tenant_id = request.user.tenant.id

        try:
            response_data = asql.execute_raw_query(
                tenant=tenant_id, 
                queries=[(
                    f"SELECT * FROM `{avars.PROCESS_TABLE_RELATIONSHIP_TABLE_NAME}` WHERE processName = %s;",
                    [process_name]
                )]
            )
            return Response(response_data)
        except OperationalError as e:
            return Response({'error': f'Database error: operation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f'Unexpected error: failed to fetch process table relationships'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def put(self, request, process_name):
        tenant_id = request.user.tenant.id
        table_names = request.data.get("tableNames")

        if not table_names:
            return Response({'error': f'Table names is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not isinstance(table_names, list):
            return Response({'error': f'Table names must be a list'}, status=status.HTTP_400_BAD_REQUEST)
        for table_name in table_names:
            table_name_valid, table_name_validation_error = aval.validate_object_name(table_name)
            if not table_name_valid:
                return Response({'error': table_name_validation_error}, status=status.HTTP_400_BAD_REQUEST)

        # get existing relationships
        try:
            response_data = asql.execute_raw_query(
                tenant=tenant_id, 
                queries=[(f"SELECT * FROM `{avars.PROCESS_TABLE_RELATIONSHIP_TABLE_NAME}` WHERE processName = %s;", [process_name])]
            )
        except OperationalError as e:
            return Response({'error': f'Database error: operation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f'Unexpected error: failed to fetch process table relationships'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        existing_table_names = [item['tableName'] for item in response_data]
        new_table_names = list(set(table_names))
        tables_to_add = list(set(new_table_names) - set(existing_table_names))
        tables_to_remove = list(set(existing_table_names) - set(new_table_names))

        try:
            # add tables
            add_tables_response_data = asql.execute_raw_query(tenant=tenant_id, queries=astmts.get_create_new_process_table_relationship_query(process_name, tables_to_add))
            
            # remove tables
            remove_tables_response_data = asql.execute_raw_query(tenant=tenant_id, queries=astmts.get_delete_process_table_relationship_query(process_name, tables_to_remove))
            
            return Response(tables_to_add, status=status.HTTP_201_CREATED)
        except OperationalError as e:
            return Response({'error': f'Database error: operation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f'Unexpected error: failed to create process table relationship'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def delete(self, request, process_name):
        tenant_id = request.user.tenant.id

        try:
            asql.execute_raw_query(
                tenant=tenant_id, 
                queries=astmts.get_delete_process_query(process_name)
            )
            
            return Response(process_name, status=status.HTTP_204_NO_CONTENT)
        except OperationalError as e:
            return Response({'error': f'Database error: operation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f'Unexpected error: failed to delete process table relationship'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)