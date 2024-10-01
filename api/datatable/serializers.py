from rest_framework import serializers
from .models import DataTableMeta, DataTableColumnMeta

class DataTableMetaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataTableMeta
        fields = ['id', 'name', 'description', 'dataSourceAdded', 'dataSource', 'extractionStatus', 
                  'extractionDetails']

class DataTableColumnMetaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataTableColumnMeta
        fields = ['id', 'name', 'dtype', 'format', 'description', 'dataTable']