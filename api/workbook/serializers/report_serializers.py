from rest_framework import serializers
from workbook.models import Report

class ColumnSerializer(serializers.Serializer):
    config = serializers.DictField(child=serializers.CharField(allow_null=True))
    formula = serializers.CharField()

    def validate_config(self, value):
        expected_keys = {'chartType', 'x'}
        
        if not isinstance(value, dict):
            raise serializers.ValidationError("Config must be a dictionary.")
        
        for key in expected_keys:
            if key not in value:
                raise serializers.ValidationError(f"Config must include '{key}'.")
        
        if value['chartType'] not in {'bar-chart', 'line-chart', 'pie-chart', 'table', None}:
            raise serializers.ValidationError(f"Invalid chart type: {value['chartType']}")
        
        return value

class RowSerializer(serializers.Serializer):
    rowType = serializers.ChoiceField(choices=['kpi', 'table'])
    columns = ColumnSerializer(many=True)

class ReportSerializer(serializers.ModelSerializer):
    rows = RowSerializer(many=True)

    class Meta:
        model = Report
        fields = ['id', 'rows']

    def validate_rows(self, value):
        # Now using RowSerializer ensures that data structure for each row is validated
        # further logic could be added here, if needed, for additional validation checks
        
        return value