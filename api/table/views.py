from django.db.utils import OperationalError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from helpers import arc_vars as avars, arc_utils as autils, arc_sql as asql, arc_statements as astmts

    
class TableListView(APIView):
    def get(self, request):
        tenant_id = request.user.tenant.id

        try:
            response_data = asql.execute_raw_query(tenant=tenant_id, queries=([("SHOW TABLES;", [])]))
            tables = []
            for response_data_item in response_data:
                tables += [v for k, v in response_data_item.items() if v not in avars.INTERNAL_TABLES]
            return Response(tables)
        except OperationalError as e:
            return Response({'error': f'Database error: operation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f'Unexpected error: failed to fetch table'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
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
            asql.execute_raw_query(tenant=tenant_id, queries=astmts.get_create_raw_table_query(table_name))

            return Response(table_name, status=status.HTTP_201_CREATED)
        except OperationalError as e:
            return Response({'error': f'Database error: operation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f'Unexpected error: failed to create table'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TableDetailView(APIView):
    def delete(self, request, table_name):
        tenant_id = request.user.tenant.id

        try:
            asql.execute_raw_query(
                tenant=tenant_id, 
                queries=astmts.get_drop_table_query(table_name)
            )
            
            return Response(table_name, status=status.HTTP_204_NO_CONTENT)
        except OperationalError as e:
            return Response({'error': f'Database error: operation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f'Unexpected error: failed to delete table'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class ColumnListView(APIView):
    def get(self, request, table_name):
        tenant_id = request.user.tenant.id

        try:
            response_data = asql.execute_raw_query(
                tenant=tenant_id, 
                queries=[(f"SELECT * FROM `{avars.COLUMN_TABLE}` WHERE tableName = '{table_name}';", [])]
            )
            
            return Response(response_data)
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
        if data_type not in avars.DATA_TYPE_MAP:
            return Response({'error': f'Invalid data type'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            asql.execute_raw_query(
                tenant=tenant_id, 
                queries=astmts.get_add_column_query(column_name=column_name, table_name=table_name, is_relationship=is_relationship, related_table=related_table, data_type=data_type, tenant_id=tenant_id)
            )
            
            # create column data response
            column_data = {
                "columnName": column_name,
                "dataType": data_type,
                "tableName": table_name,
                "isRelationship": is_relationship,
                "relatedTable": related_table
            }
            return Response(column_data, status=status.HTTP_201_CREATED)
        except OperationalError as e:
            return Response({'error': f'Database error: operation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f'Unexpected error: failed to add column'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ColumnDetailView(APIView):
    def delete(self, request, table_name, column_name):
        tenant_id = request.user.tenant.id

        try:
            asql.execute_raw_query(
                tenant=tenant_id, 
                queries=astmts.get_delete_column_query(column_name=column_name, table_name=table_name, tenant_id=tenant_id)
            )
            
            return Response(column_name, status=status.HTTP_204_NO_CONTENT)
        except OperationalError as e:
            return Response({'error': f'Database error: operation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f'Unexpected error: failed to delete column'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)