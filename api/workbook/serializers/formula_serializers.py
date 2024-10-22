from rest_framework import serializers
from workbook.models import Formula, FormulaMessage

class FormulaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Formula
        fields = ['id', 'name', 'description', 'arcSql', 'isActive', 'isValidated', 'createdAt']
        read_only_fields = ['id', 'createdAt', 'arcSql']

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
        fields = ['id', 'user', 'userType', 'messageType', 'name', 'description', 'arcSql', 'text', 'createdAt']
        read_only_fields = ['id', 'createdAt', 'retries', 'fullConversation', 'inputToken', 'outputToken', 'startTime', 'endTime', 'runDetails']

    def create(self, validated_data):
        user = self.context['request'].user
        formula = self.context['formula']

        message = FormulaMessage.objects.create(
            user=user,
            formula=formula,
            userType=validated_data.get('userType'),
            text=validated_data.get('text', None)
        )

        return message

class FormulaValidateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Formula
        fields = ['isValidated'] # only allow updating of isValidated field