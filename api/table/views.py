from datetime import datetime
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from workspace.models import Workspace
from table.models import TableType
from table.serializers import TableTypeSerializer

class TableTypeViewSet(viewsets.ModelViewSet):
    serializer_class = TableTypeSerializer

    def get_queryset(self, workspace_pk=None):
        user = self.request.user
        if user.is_authenticated and user.tenant and workspace_pk:
            workspace = Workspace.objects.get(pk=workspace_pk)
            return TableType.objects.filter(tenant=user.tenant, workspace=workspace)
        else:
            return TableType.objects.none()
        
    def get_object(self, workspace_pk=None):
        queryset = self.get_queryset(workspace_pk)
        obj = get_object_or_404(queryset, pk=self.kwargs["id"])
        return obj
    
    def list(self, request, workspace_pk=None):
        queryset = self.get_queryset(workspace_pk=workspace_pk)
        serializer = TableTypeSerializer(queryset, many=True)

        return Response(serializer.data)
    
    def detail(self, request, workspace_pk=None):
        table = self.get_object(workspace_pk=workspace_pk)
        serializer = TableTypeSerializer(table)
        return Response(serializer.data)
    
    def create(self, request, workspace_pk=None):
        serializer = TableTypeSerializer(data=request.data, context={"request": request, "workspace_id": workspace_pk})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)