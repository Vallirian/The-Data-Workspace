from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import DataTableMeta
from workbook.models import Workbook
from .serializers import DataTableMetaSerializer

class DataTableMetaByWorkbookAPIView(APIView):
    def get(self, request, workbook_id):
        workbook = get_object_or_404(Workbook, id=workbook_id, user=request.user)
        data_table_meta = get_object_or_404(DataTableMeta, workbook=workbook)
        serializer = DataTableMetaSerializer(data_table_meta)
        return Response(serializer.data)

    def put(self, request, workbook_id):
        workbook = get_object_or_404(Workbook, id=workbook_id, user=request.user)
        data_table_meta = get_object_or_404(DataTableMeta, workbook=workbook)
        serializer = DataTableMetaSerializer(data_table_meta, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
