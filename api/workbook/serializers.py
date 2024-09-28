from rest_framework import serializers
from .models import Workbook

class WorkbookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workbook
        fields = ['id', 'createdAt', 'dataTable']  
        read_only_fields = ['id', 'createdAt', 'user'] 