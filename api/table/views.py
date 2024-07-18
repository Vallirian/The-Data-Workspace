from datetime import datetime
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from workspace.models import Workspace
from table.models import Table
from table.serializers import TableSerializer
from table.raw_table_sql_operations import get_raw_table

class TableViewSet(viewsets.ModelViewSet):
    serializer_class = TableSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.tenant:
            return Table.objects.filter(tenant=user.tenant)
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
    

class RawTableView(APIView):
    def get(self, request, table_id):
        table = get_raw_table(table_id)
        print(table)
        return Response(table)