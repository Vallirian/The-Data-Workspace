from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from workspace.models import Workspace, TableMetaData
from workspace.serializers import TableMetaDataSerializer
from services.preprocessor.import_data import DataImporter
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
                DataImporter(
                    request=request,
                    data=data,
                    metadata=MetaData(tableName=table_metadata.tableName, columns=table_metadata.columns)
                ).import_data()

                workspace.tableMetadata = table_metadata
                workspace.save()
                return Response(TableMetaDataSerializer(table_metadata).data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
