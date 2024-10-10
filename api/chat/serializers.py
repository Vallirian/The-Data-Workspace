from rest_framework import serializers
from .models import AnalysisChat, AnalysisChatMessage
from django.contrib.auth import get_user_model

User = get_user_model()

class AnalysisChatMessageSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField() 

    class Meta:
        model = AnalysisChatMessage
        fields = [
            'id', 'chat', 'user', 'userType', 'createdAt', 'text', 'name', 
            'description', 'messageType'
        ]
        read_only_fields = ['id', 'createdAt']  

    def create(self, validated_data):
        user = self.context['request'].user
        chat = validated_data.get('chat')

        message = AnalysisChatMessage.objects.create(
            user=user,
            chat=chat,
            userType=validated_data.get('userType'),
            text=validated_data.get('text', None),
            name=validated_data.get('name', None),
            description=validated_data.get('description', None),
            messageType=validated_data.get('messageType', 'text'),
            input_token=validated_data.get('input_token', 0),
            output_token=validated_data.get('output_token', 0)
        )

        return message

class AnalysisChatSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    workbook = serializers.StringRelatedField()
    dataTable = serializers.StringRelatedField()

    class Meta:
        model = AnalysisChat
        fields = [
            'id', 'user', 'workbook', 'dataTable', 'threadId', 'updatedAt', 'topic'
        ]
        read_only_fields = ['id', 'updatedAt', 'analysis_messages']

    def create(self, validated_data):
        user = self.context['request'].user
        workbook = validated_data.get('workbook')
        data_table = validated_data.get('dataTable')

        analysis_chat = AnalysisChat.objects.create(
            user=user,
            workbook=workbook,
            dataTable=data_table
        )

        return analysis_chat
