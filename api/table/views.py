from django.db.utils import OperationalError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from helpers import arc_vars as avars, arc_utils as autils, arc_sql as asql
from rawdata import raw_data_helpers as rdh

    
class TableListView(APIView):
    def get(self, request):
        tenant_id = request.user.tenant.id

        try:
            response_data = asql.execute_raw_query(tenant=tenant_id, query="SHOW TABLES;")
            tables = []
            for response_data_item in response_data:
                tables += [v for k, v in response_data_item.items()]
            return Response(tables)
        except OperationalError as e:
            return Response({'error': f'Database error: operation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f'Unexpected error: failed to create table'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def post(self, request):
        tenant_id = request.user.tenant.id
        table_name = request.data.get("tableName")

        if not table_name:
            return Response({'error': f'Table name is required'}, status=status.HTTP_400_BAD_REQUEST)
        table_name_valid, table_name_validation_error = autils.validate_object_name(table_name)
        if not table_name_valid:
            return Response({'error': table_name_validation_error}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Create table
            asql.execute_raw_query(tenant=tenant_id, query=rdh.get_create_raw_table_query(table_name))

            return Response({'message': f'Table {table_name} created'}, status=status.HTTP_201_CREATED)
        except OperationalError as e:
            return Response({'error': f'Database error: operation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f'Unexpected error: failed to create table'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class ColumnListView(APIView):
    def get(self, request, table_name):
        tenant_id = request.user.tenant.id

        try:
            response_data = asql.execute_raw_query(tenant=tenant_id, query=f"SELECT * FROM {avars.column_table} WHERE tableName = '{table_name}';")
            columns = []
            for response_data_item in response_data:
                columns += [response_data_item]
            
            return Response(columns)
        except OperationalError as e:
            return Response({'error': f'Database error: operation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f'Unexpected error: failed to get columns'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def post(self, request, table_name):
        tenant_id = request.user.tenant.id
        column_name = request.data.get("columnName")
        data_type = request.data.get("dataType")
        is_relationship = request.data.get("isRelationship")
        related_table = request.data.get("relatedTable")

        if not column_name:
            return Response({'error': f'Column name is required'}, status=status.HTTP_400_BAD_REQUEST)
        column_name_valid, column_name_validation_error = autils.validate_object_name(column_name)
        if not column_name_valid:
            return Response({'error': column_name_validation_error}, status=status.HTTP_400_BAD_REQUEST)
        
        if not data_type:
            return Response({'error': f'Data type is required'}, status=status.HTTP_400_BAD_REQUEST)
        if data_type not in avars.data_type_map:
            return Response({'error': f'Invalid data type'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            asql.execute_raw_query(tenant=tenant_id, query=rdh.get_add_column_query(column_name=column_name, table_name=table_name, is_relationship=is_relationship, related_table=related_table, data_type=data_type, tenant_id=tenant_id))
            
            return Response({'message': f'Column {column_name} added to {table_name}'}, status=status.HTTP_201_CREATED)
        except OperationalError as e:
            return Response({'error': f'Database error: operation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f'Unexpected error: failed to add column'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)