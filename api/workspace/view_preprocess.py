from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from workspace.models import Workspace, TableMetaData
from workspace.serializers import TableMetaDataSerializer
from services.preprocessor.preprocessor import Preprocessor
from services.helpers.interfaces import MetaData

class TableMetaDataListCreateAPIView(APIView):
    def get(self, request, workspace_id):
        workspace = get_object_or_404(Workspace, id=workspace_id, user=request.user)
        table_meta = TableMetaData.objects.filter(workspace=workspace)
        serializer = TableMetaDataSerializer(table_meta, many=True)
        return Response(serializer.data)

    def post(self, request, workspace_id):
        try:
            # print(request.data)
            workspace = get_object_or_404(Workspace, id=workspace_id, user=request.user)
            serializer = TableMetaDataSerializer(data=request.data.get('metadata', {}))
            if serializer.is_valid():
                table_metadata = serializer.save()
                data = request.data.get('file', [])
                # import data into the newly created table
                Preprocessor(
                    request=request,
                    metadata=MetaData(tableName=table_metadata.tableName, columns=table_metadata.columns)
                ).import_data(data=data)

                workspace.tableMetadata = table_metadata
                workspace.save()
                return Response(TableMetaDataSerializer(table_metadata).data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TableMetaDataDetailAPIView(APIView):
    def get(self, request, workspace_id, table_id):
        workspace = get_object_or_404(Workspace, id=workspace_id, user=request.user)
        table_metadata = get_object_or_404(TableMetaData, id=table_id, workspace=workspace)
        serializer = TableMetaDataSerializer(table_metadata)
        
        # Assuming you have a method to get raw data
        raw_data = Preprocessor(
            request=request,
            metadata=MetaData(tableName=table_metadata.tableName, columns=table_metadata.columns)
        ).get_data()
        
        response_data = {
            'metadata': serializer.data,
            'file': raw_data
        }
        
        return Response(response_data)
    
class ProfileAPIView(APIView):
    def get(self, request, workspace_id, table_id, profile_type):
        workspace = get_object_or_404(Workspace, id=workspace_id, user=request.user)
        table_metadata = get_object_or_404(TableMetaData, id=table_id, workspace=workspace)
        
        profile = Preprocessor(
            request=request,
            metadata=MetaData(tableName=table_metadata.tableName, columns=table_metadata.columns)
        ).get_profile(profile_type)
        print(profile)
        return Response(profile)