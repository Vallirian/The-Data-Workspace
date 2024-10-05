from rest_framework import serializers
from .models import Formula

class FormulaSerializer(serializers.ModelSerializer):
    validatedSQL = serializers.SerializerMethodField()

    class Meta:
        model = Formula
        fields = ['id', 'name', 'description', 'validatedSQL', 'isActive', 'isValidated', 'createdAt']
        read_only_fields = ['id', 'createdAt', 'validatedSQL']

    # Method to get translated PQL
    def get_validatedSQL(self, obj):
        return obj.translate_pql()

class FormulaValidateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Formula
        fields = ['isValidated'] # only allow updating of isValidated field