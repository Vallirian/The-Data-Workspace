from django.db.utils import OperationalError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from helpers import arc_vars as avars, arc_utils as autils, arc_sql as asql, arc_statements as astmts

class ProcessListView(APIView):
    def get(self, request):
        tenant_id = request.user.tenant.id

        try:
            response_data = asql.execute_raw_query(tenant=tenant_id, queries=([(f"SELECT * FROM `{avars.PROCESSES_TABLE_NAME}`;", [])]))
            # when no processes are created yet, we need to remove the placeholder process send from asql.execute_raw_query
            if len(response_data) == 1:
                if response_data[0]['id'] == None:
                    return Response([])
            return Response(response_data)
        except OperationalError as e:
            return Response({'error': f'Database error: operation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f'Unexpected error: failed to fetch processes'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def post(self, request):
        tenant_id = request.user.tenant.id
        process_name = request.data.get("processName")

        if not process_name:
            return Response({'error': f'Process name is required'}, status=status.HTTP_400_BAD_REQUEST)
        table_name_valid, table_name_validation_error = autils.validate_object_name(process_name)
        if not table_name_valid:
            return Response({'error': table_name_validation_error}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Create table
            asql.execute_raw_query(tenant=tenant_id, queries=astmts.get_create_new_process_query(process_name))
            return Response(process_name, status=status.HTTP_201_CREATED)
        except OperationalError as e:
            return Response({'error': f'Database error: operation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f'Unexpected error: failed to create process'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class ProcessTableRelationshipListView(APIView):
    def get(self, request, process_id):
        tenant_id = request.user.tenant.id

        try:
            response_data = asql.execute_raw_query(
                tenant=tenant_id, 
                queries=[(
                    f"SELECT * FROM `{avars.PROCESS_TABLE_RELATIONSHIP_TABLE_NAME}` WHERE processId = %s;",
                    [process_id]
                )]
            )
            return Response(response_data)
        except OperationalError as e:
            return Response({'error': f'Database error: operation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f'Unexpected error: failed to fetch process table relationships'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def post(self, request, process_id):
        tenant_id = request.user.tenant.id
        table_name = request.data.get("tableName")

        if not table_name:
            return Response({'error': f'Table name is required'}, status=status.HTTP_400_BAD_REQUEST)
        table_name_valid, table_name_validation_error = autils.validate_object_name(table_name)
        if not table_name_valid:
            return Response({'error': table_name_validation_error}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Create table
            asql.execute_raw_query(tenant=tenant_id, queries=astmts.get_create_new_process_table_relationship_query(process_id, table_name))
            return Response(table_name, status=status.HTTP_201_CREATED)
        except OperationalError as e:
            return Response({'error': f'Database error: operation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f'Unexpected error: failed to create process table relationship'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)