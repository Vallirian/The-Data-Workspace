from rest_framework import serializers
from .models import DataTableMeta

class DataTableMetaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataTableMeta
        fields = ['id', 'name', 'description', 'dataSource', 'extractionStatus', 'extractionDetails']
