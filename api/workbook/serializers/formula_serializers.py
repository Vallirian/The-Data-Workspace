from rest_framework import serializers
from workbook.models import Formula, FormulaMessage

class FormulaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Formula
        fields = ['id', 'name', 'description', 'arcSql', 'isActive', 'isValidated', 'createdAt', 'fromulaType']
        read_only_fields = ['id', 'createdAt', 'arcSql', 'fromulaType']

    def create(self, validated_data):
        user = self.context['request'].user
        workbook = self.context['workbook']
        data_table = self.context['dataTable']

        formula = Formula.objects.create(
            user=user,
            workbook=workbook,
            dataTable=data_table
        )

        return formula

class FormulaMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormulaMessage
        fields = ['id', 'formula', 'createdAt', 'userType', 
                  'messageType', 'name', 'description', 'text']
        read_only_fields = ['id', 'user', 'createdAt', 'rawArcSql', 'retries', 'runDetails', 'inputTokensConsumed', 'outputTokensConsumed']

    def create(self, validated_data):
        user = self.context['request'].user

        message = FormulaMessage.objects.create(
            user=user,
            formula=validated_data.get('formula'),
            userType=validated_data.get('userType'),
            text=validated_data.get('text', None)
        )

        return message

class FormulaValidateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Formula
        fields = ['isValidated'] # only allow updating of isValidated field