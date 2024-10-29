from rest_framework import serializers
from workbook.models import Report
from django.core.validators import validate_email
from django.core.exceptions import ValidationError

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
        fields = ['id', 'rows', 'sharedWith']

    def validate_sharedWith(self, value):
        # Remove any empty elements and ensure uniqueness
        valid_emails = set(filter(None, value))

        # Validate each email address
        for email in valid_emails:
            try:
                validate_email(email)
            except ValidationError:
                raise serializers.ValidationError(f"'{email}' is not a valid email address.")

        return list(valid_emails)

    def validate(self, data):
        # Call the 'validate_sharedWith' method to clean and validate the emails
        data['sharedWith'] = self.validate_sharedWith(data.get('sharedWith', []))
        return data