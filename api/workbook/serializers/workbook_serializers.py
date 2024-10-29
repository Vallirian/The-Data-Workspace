from rest_framework import serializers
from workbook.models import Workbook, DataTableMeta, DataTableColumnMeta, Report

class WorkbookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workbook
        fields = ['id', 'createdAt', 'dataTable', 'report']  
        read_only_fields = ['id', 'createdAt', 'user'] 
    
    def create(self, validated_data):
        user = validated_data['user']

        # Create the DataTableMeta and Report instances
        data_table = DataTableMeta.objects.create(user=user)
        report = Report.objects.create(user=user, rows=[])

        # Create the Workbook and link the related objects
        workbook = Workbook.objects.create(
            user=user,
            dataTable=data_table,
            report=report
        )

        return workbook