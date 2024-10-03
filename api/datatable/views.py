from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import DataTableMeta, DataTableColumnMeta
from workbook.models import Workbook
from .serializers import DataTableMetaSerializer, DataTableColumnMetaSerializer
from django.core.files.storage import default_storage
from services.db_ops.db import RawDataExtraction
import services.db_ops.query_factory as qf
import services.db_ops.helpers as db_hlp
from django.db import connection

class DataTableMetaByWorkbookAPIView(APIView):
    def get(self, request, workbook_id, table_id):
        workbook = get_object_or_404(Workbook, id=workbook_id, user=request.user)
        data_table_meta = get_object_or_404(DataTableMeta, workbook=workbook, id=table_id)
        serializer = DataTableMetaSerializer(data_table_meta)
        return Response(serializer.data)
    
class DataTableMetaColumnsByWorkbookAPIView(APIView):
    def get(self, request, workbook_id, table_id):
        workbook = get_object_or_404(Workbook, id=workbook_id, user=request.user)
        data_table_meta = get_object_or_404(DataTableMeta, workbook=workbook, id=table_id)
        columns = DataTableColumnMeta.objects.filter(dataTable=data_table_meta).order_by('order')
        serializer = DataTableColumnMetaSerializer(columns, many=True)
        return Response(serializer.data)
    
class DataTableAPIView(APIView):
    def get(self, request, workbook_id, table_id):
        try:
            page = 1 if 'page' not in request.query_params else int(request.query_params['page'])
            page_size = 25

            workbook = get_object_or_404(Workbook, id=workbook_id, user=request.user)
            data_table_meta = get_object_or_404(DataTableMeta, workbook=workbook, id=table_id)

            _table_name = f'table___{data_table_meta.id}'
            _items_query, _items_inputs = qf.gen_get_raw_data_sql(_table_name, page, page_size)
            _count_query, _count_inputs = qf.gen_get_raw_data_count_sql(_table_name)

            with connection.cursor() as cursor:
                cursor.execute(_items_query, _items_inputs)
                _items_result = db_hlp.dictfetchall(cursor)

                cursor.execute(_count_query, _count_inputs)
                _count_result = db_hlp.dictfetchall(cursor)
                print('count', _count_result)

            result = {
                "items": _items_result,
                "totalItemsCount": _count_result[0]['count'],
                "currentPage": page,
                "pageSize": page_size
            }
            
            return Response(result)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        

class DataTableExtractionAPIView(APIView):
    def post(self, request, workbook_id, table_id):
        workbook = get_object_or_404(Workbook, id=workbook_id, user=request.user)
        data_table_meta = get_object_or_404(DataTableMeta, workbook=workbook, id=table_id)
        
        print(request.data)

        if data_table_meta.dataSourceAdded:
            return Response({"error": "Data source already added"}, status=status.HTTP_400_BAD_REQUEST)
        
        assert request.data, "No data  information provided"
        assert 'dataSource' in request.data, "No dataSource provided"
        assert 'data' in request.data, "No data provided"
        assert 'columns' in request.data, "No columns provided"

        
        # create table
        data_table_meta.dataSourceAdded = True
        data_table_meta.name = request.data['name']
        data_table_meta.dataSource = request.data['dataSource']
        data_table_meta.extractionStatus = 'pending'
        data_table_meta.save()

        # create columns
        _columns = []
        for idx, column in enumerate(request.data['columns']):
            _column = DataTableColumnMeta()
            _column.name = column['name']
            _column.dtype = column['dtype']
            _column.format = column['format']
            _column.description = column['description']
            _column.dataTable = data_table_meta
            _column.order = idx + 1  # Set the order based on the index
            _columns.append(_column)
        DataTableColumnMeta.objects.bulk_create(_columns)

        # TODO: run on a separate thread ---------- START ----------
        # extract data
        raw_data_extractor = RawDataExtraction(request, workbook_id, table_id)
        _extraction_status, _extraction_message = raw_data_extractor.extract_data(etype=request.data['dataSource'], data=request.data['data'])
        
        print('extraction status', _extraction_status, _extraction_message)

        if _extraction_status:
            data_table_meta.extractionStatus = 'success'
            data_table_meta.extractionDetails = _extraction_message
            data_table_meta.save()
            return Response(status=status.HTTP_200_OK)

        else:
            data_table_meta.extractionStatus = 'error'
            data_table_meta.extractionDetails = _extraction_message
            data_table_meta.save()
            return Response({"error": _extraction_message}, status=status.HTTP_400_BAD_REQUEST)
        # TODO: run on a separate thread ---------- END ----------
    
    def delete(self, request, workbook_id, table_id):
        workbook = get_object_or_404(Workbook, id=workbook_id, user=request.user)
        data_table_meta = get_object_or_404(DataTableMeta, workbook=workbook, id=table_id)

        DataTableColumnMeta.objects.filter(dataTable=data_table_meta).delete()

        # Reset fields related to data source
        data_table_meta.dataSourceAdded = False
        data_table_meta.name = 'Untitled Table'
        data_table_meta.dataSource = None
        data_table_meta.extractionStatus = 'pending'
        data_table_meta.extractionDetails = ""

        # delete raw data
        raw_data_extractor = RawDataExtraction(request, workbook_id, table_id)
        _delete_status, _delete_message = raw_data_extractor.delete_table()

        if _delete_status:
            data_table_meta.save()
            return Response(status=status.HTTP_200_OK)
        else:
            return Response({"error": _delete_message}, status=status.HTTP_400_BAD_REQUEST)