from datetime import datetime
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from workspace.models import Workspace
from workspace.serializers import WorkspaceSerializer

class WorkspaceViewSet(viewsets.ModelViewSet):
    serializer_class = WorkspaceSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.tenant:
            return Workspace.objects.filter(tenant=user.tenant)
        else:
            return Workspace.objects.none() # when user is not authenticated or tenant is not set

    def get_object(self):
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, pk=self.kwargs["pk"])
        return obj
    
    def list(self, request):
        print('request came in', datetime.now())
        queryset = self.get_queryset()
        serializer = WorkspaceSerializer(queryset, many=True)
        print('request processed', datetime.now())

        return Response(serializer.data)
    
    def create(self, request):
        serializer = WorkspaceSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)