from datetime import datetime
from django.db import connection
from django.db.utils import OperationalError

from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from table.models import Table
from table.serializers import TableSerializer
from helpers import arc_vars as avars, arc_utils as autils, arc_sql as asql
from rawdata import raw_data_helpers as rdh

class TableViewSet(viewsets.ModelViewSet):
    serializer_class = TableSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.tenant:
            return Table.objects.filter(tenant=user.tenant).order_by("updatedAt")
        else:
            return Table.objects.none()
        
    def get_object(self):
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, pk=self.kwargs["pk"])
        return obj
    
    def list(self, request):
        queryset = self.get_queryset()
        serializer = TableSerializer(queryset, many=True)

        return Response(serializer.data)
    
    def detail(self, request):
        table = self.get_object()
        serializer = TableSerializer(table)
        return Response(serializer.data)
    
    def create(self, request):
        serializer = TableSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class TableListView(APIView):
    def get(self, request):
        tenant_id = request.user.tenant.id

        try:
            response_data = asql.execute_raw_query(tenant=tenant_id, query="SHOW TABLES;")
            tables = [table[0] for table in response_data]
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
            response_data = asql.execute_raw_query(tenant=tenant_id, query=f"SHOW COLUMNS FROM {table_name};")
            columns = [column[0] for column in response_data]
            print(columns)
            return Response(columns)
        except OperationalError as e:
            return Response({'error': f'Database error: operation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f'Unexpected error: failed to get columns'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def post(self, request, table_name):
        tenant_id = request.user.tenant.id
        column_name = request.data.get("columnName")
        data_type = request.data.get("dataType")

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
            asql.execute_raw_query(tenant=tenant_id, query=f"ALTER TABLE {table_name} ADD COLUMN {column_name} {avars.data_type_map[data_type]};")
            return Response({'message': f'Column {column_name} added to {table_name}'}, status=status.HTTP_201_CREATED)
        except OperationalError as e:
            return Response({'error': f'Database error: operation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f'Unexpected error: failed to add column'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)