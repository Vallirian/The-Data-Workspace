from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from workspace.models import Workspace
from workspace.serializers import WorkspaceSerializer

class WorkspaceListCreateAPIView(APIView):
    def get(self, request):
        workspaces = Workspace.objects.filter(user=request.user).order_by('-created')
        serializer = WorkspaceSerializer(workspaces, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = WorkspaceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
