from rest_framework import serializers
from workbook.models import Report

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['id', 'rows']  

    def validate_rows(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Rows must be a list of lists.")
        for row in value:
            if not isinstance(row, list):
                raise serializers.ValidationError("Each row must be a list.")
        return value
