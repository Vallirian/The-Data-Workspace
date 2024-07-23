from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status

from django.shortcuts import get_object_or_404

from column.models import Column
from column.serializers import ColumnSerializer
from table.models import Table
from table.serializers import TableSerializer


class ColumnViewSet(viewsets.ModelViewSet):
    serializer_class = ColumnSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.tenant:
            return Column.objects.filter(tenant=user.tenant, table=self.kwargs["table_pk"]).order_by("updatedAt")
        else:
            return Column.objects.none()
        
    def get_object(self):
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, pk=self.kwargs["pk"])
        return obj
    
    def list(self, request, table_pk):
        queryset = self.get_queryset()
        serializer = ColumnSerializer(queryset, many=True)

        return Response(serializer.data)
    
    def detail(self, request):
        column = self.get_object()
        serializer = ColumnSerializer(column)
        return Response(serializer.data)
    
    def create(self, request, table_pk):
        serializer = ColumnSerializer(data=request.data, context={"request": request, "table_id": table_pk})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)