from rest_framework import serializers
from workbook.models import Workbook, DataTableMeta, DataTableColumnMeta, Report
import services.values as svc_vals

class WorkbookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workbook
        fields = ['id', 'name', 'createdAt', 'dataTable', 'report']  
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
    
    def validate_name(self, value):
        if len(value) > 255:
            raise serializers.ValidationError("Name must be 255 characters or fewer.")
        
        if value.lower() in svc_vals.SQL_RESERVED_KEYWORDS:
            raise serializers.ValidationError(f"'{value}' is a reserved SQL keyword.")
        
        if value.lower() in svc_vals.SQL_DDL_KEYWORDS:
            raise serializers.ValidationError(f"'{value}' is a reserved for SQL, and invalid.")
        
        for char in svc_vals.INVALID_CHARACTERS_IN_NAME:
            if char in value:
                raise serializers.ValidationError(f"'{char}' is not allowed in a name.")
            
            return value
        
    def validate(self, data):
        if 'name' in data:
            data['name'] = self.validate_name(data.get('name', 'Untitled Workbook'))
        
        return data