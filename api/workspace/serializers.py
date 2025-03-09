from rest_framework import serializers
from workspace.models import Workspace, TableMetaData

class WorkspaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workspace
        fields = ['id', 'name', 'created', 'lastModified', 'analysis']

class TableMetaDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = TableMetaData
        fields = [
            'id',
            'tableName',
            'columns',
            'created',
            'lastModified',
            'status',
            'totalIssues',
            'issuesResolved'
        ]