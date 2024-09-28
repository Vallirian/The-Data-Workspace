from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Workbook
from .serializers import WorkbookSerializer
from django.shortcuts import get_object_or_404
from datatable.models import DataTableMeta

class WorkbookListAPIView(APIView):
    def get(self, request):
        workbooks = Workbook.objects.filter(user=request.user).order_by('-createdAt')
        serializer = WorkbookSerializer(workbooks, many=True)
        return Response(serializer.data)

    def post(self, request):
        workbook = Workbook.objects.create(user=request.user)
        data_table = DataTableMeta.objects.create(name=f"Untitled Table", description="Table description", dataSourceAdded=False)
        workbook.dataTable = data_table
        workbook.save()

        serializer = WorkbookSerializer(workbook)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class WorkbookDetailAPIView(APIView):
    def get(self, request, pk):
        workbook = get_object_or_404(Workbook, id=pk, user=request.user)
        serializer = WorkbookSerializer(workbook)
        return Response(serializer.data)
    
    def delete(self, request, pk):
        workbook = get_object_or_404(Workbook, id=pk, user=request.user)
        workbook.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)