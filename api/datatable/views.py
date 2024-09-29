from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import DataTableMeta
from workbook.models import Workbook
from .serializers import DataTableMetaSerializer
from django.core.files.storage import default_storage
from services.db_ops.db import RawDataExtraction


class DataTableMetaByWorkbookAPIView(APIView):
    def get(self, request, workbook_id, table_id):
        workbook = get_object_or_404(Workbook, id=workbook_id, user=request.user)
        data_table_meta = get_object_or_404(DataTableMeta, workbook=workbook, id=table_id)
        serializer = DataTableMetaSerializer(data_table_meta)
        return Response(serializer.data)

    def put(self, request, workbook_id, table_id):
        workbook = get_object_or_404(Workbook, id=workbook_id, user=request.user)
        data_table_meta = get_object_or_404(DataTableMeta, workbook=workbook, id=table_id)
        serializer = DataTableMetaSerializer(data_table_meta, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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

        
        # TODO: run on a separate thread
        data_table_meta.dataSourceAdded = True
        data_table_meta.name = request.data['name']
        data_table_meta.dataSource = request.data['dataSource']
        data_table_meta.extractionStatus = 'pending'
        data_table_meta.save()

        # extract data
        raw_data_extractor = RawDataExtraction(request, workbook_id, table_id)
        _extraciton_status, _extraction_message = raw_data_extractor.extract_data(etype=request.data['dataSource'], data=request.data['data'])
        print(_extraciton_status, _extraction_message)

        if _extraciton_status:
            data_table_meta.extractionStatus = 'success'
            data_table_meta.extractionDetails = _extraction_message

        else:
            data_table_meta.extractionStatus = 'error'
            data_table_meta.extractionDetails = _extraction_message

        data_table_meta.save()
        
        return Response(status=status.HTTP_200_OK)