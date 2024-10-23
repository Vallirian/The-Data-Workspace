import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from workbook.models import DataTableMeta, DataTableColumnMeta
from workbook.serializers.datatable_serializers import DataTableMetaSerializer, DataTableColumnMetaSerializer
from services.db import RawData


class DataTableMetaDetailAPIView(APIView):
    def get(self, request, table_id, *args, **kwargs):
        datatable_meta = get_object_or_404(DataTableMeta, id=table_id, user=request.user)
        serializer = DataTableMetaSerializer(datatable_meta)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request, table_id, *args, **kwargs):
        datatable_meta = get_object_or_404(DataTableMeta, id=table_id, user=request.user)
        serializer = DataTableMetaSerializer(datatable_meta, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class DataTableColumnMetaListAPIView(APIView):
    def get(self, request, table_id, *args, **kwargs):
        datatable_meta = get_object_or_404(DataTableMeta, id=table_id, user=request.user)
        columns = DataTableColumnMeta.objects.filter(dataTable=datatable_meta, user=request.user).order_by('order')
        serializer = DataTableColumnMetaSerializer(columns, many=True)
        return Response(serializer.data)
    
class DataTableColumnMetaDetailAPIView(APIView):
    def get(self, request, column_id, *args, **kwargs):
        column = get_object_or_404(DataTableColumnMeta, id=column_id, user=request.user)
        serializer = DataTableColumnMetaSerializer(column)
        return Response(serializer.data)
    
    def put(self, request, column_id, *args, **kwargs):
        column = get_object_or_404(DataTableColumnMeta, id=column_id, user=request.user)
        serializer = DataTableColumnMetaSerializer(column, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class DataTableRawAPIView(APIView):
    def get(self, request, table_id, *args, **kwargs):
        try:
            page = 1 if 'page' not in request.query_params else int(request.query_params['page'])
            page_size = int(os.getenv('PAGE_SIZE', 25))

            raw_data_ops = RawData(request=request, table_id=table_id)
            _data_status, _data_values = raw_data_ops.get_data(page_size=page_size, page_number=page)
            if not _data_status:
                return Response({"error": _data_values}, status=status.HTTP_400_BAD_REQUEST)
            
            _count_status, _count_result = raw_data_ops.get_data_count()
            if not _count_status:
                return Response({"error": _count_result}, status=status.HTTP_400_BAD_REQUEST)

            return Response({
                "items": _data_values,
                "totalItemsCount": _count_result,
                "currentPage": page,
                "pageSize": page_size
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class DataTableExtractionAPIView(APIView):
    def post(self, request, table_id, *args, **kwargs):
        datatable_meta = get_object_or_404(DataTableMeta, id=table_id, user=request.user)

        if datatable_meta.dataSourceAdded:
            return Response({"error": "Data source already added"}, status=status.HTTP_400_BAD_REQUEST)
        
        assert request.data, "No data  information provided"
        assert 'dataSource' in request.data, "No dataSource provided"
        assert 'data' in request.data, "No data provided"
        assert 'columns' in request.data, "No columns provided"

        
        # update datatable meta
        datatable_meta.dataSourceAdded = True
        datatable_meta.name = request.data['name']
        datatable_meta.dataSource = request.data['dataSource']
        datatable_meta.extractionStatus = 'pending'
        datatable_meta.save()

        # create columns
        _columns = []
        for idx, column in enumerate(request.data['columns']):
            _column = DataTableColumnMeta()
            _column.name = column['name']
            _column.dtype = column['dtype']
            _column.format = column['format']
            _column.description = column['description']
            _column.dataTable = datatable_meta
            _column.order = idx + 1  # Set the order based on the index
            _column.user = request.user
            _columns.append(_column)
        DataTableColumnMeta.objects.bulk_create(_columns)

        # TODO: run on a separate thread ---------- START ----------
        # extract data
        raw_data_ops = RawData(request=request, table_id=table_id)
        _extraction_status, _extraction_message = raw_data_ops.extract_data(request.data['data'])
        
        print('extraction status', _extraction_status, _extraction_message)

        if _extraction_status:
            datatable_meta.extractionStatus = 'success'
            datatable_meta.extractionDetails = _extraction_message
            datatable_meta.save()
            return Response(status=status.HTTP_200_OK)

        else:
            datatable_meta.extractionStatus = 'error'
            datatable_meta.extractionDetails = _extraction_message
            datatable_meta.save()
            return Response({"error": _extraction_message}, status=status.HTTP_400_BAD_REQUEST)
        # TODO: run on a separate thread ---------- END ----------
    
    def delete(self, request, table_id, *args, **kwargs):
        datatable_meta = get_object_or_404(DataTableMeta, id=table_id, user=request.user)
        DataTableColumnMeta.objects.filter(dataTable=datatable_meta).delete()

        # Reset fields related to data source
        datatable_meta.dataSourceAdded = False
        datatable_meta.name = 'Untitled Table'
        datatable_meta.dataSource = None
        datatable_meta.extractionStatus = 'pending'
        datatable_meta.extractionDetails = ""

        # delete raw data
        raw_data_ops = RawData(request=request, table_id=table_id)
        _delete_status, _delete_message = raw_data_ops.delete_table()

        if _delete_status:
            datatable_meta.save()
            return Response(status=status.HTTP_200_OK)
        else:
            return Response({"error": _delete_message}, status=status.HTTP_400_BAD_REQUEST)