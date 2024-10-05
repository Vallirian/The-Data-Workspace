from rest_framework import serializers
from .models import AnalysisChat, AnalysisChatMessage
from django.contrib.auth import get_user_model

User = get_user_model()

# Serializer for retrieving chat details, including nested messages (for reading)
class AnalysisChatSerializer(serializers.ModelSerializer):
    userId = serializers.PrimaryKeyRelatedField(source='user.id', read_only=True)
    workbookId = serializers.PrimaryKeyRelatedField(source='workbook.id', read_only=True)
    dataTableId = serializers.PrimaryKeyRelatedField(source='dataTable.id', read_only=True)

    class Meta:
        model = AnalysisChat
        fields = ['id', 'userId', 'workbookId', 'dataTableId', 'updatedAt', 'topic']

# Serializer for creating a new chat (only requires a chat name)
class AnalysisChatCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalysisChat
        fields = ['id']  

    def create(self, validated_data):
        user = self.context['request'].user
        workbook = self.context['workbook']
        data_table = self.context['dataTable']

        return AnalysisChat.objects.create(
            user=user,
            workbook=workbook,
            dataTable=data_table,
            **validated_data
        )

# Serializer for retrieving messages within a chat (for reading)
class AnalysisChatMessageSerializer(serializers.ModelSerializer):
    userId = serializers.PrimaryKeyRelatedField(source='user.id', read_only=True)

    class Meta:
        model = AnalysisChatMessage
        fields = ['id', 'text', 'userId', 'userType', 'createdAt']

# Serializer for sending a message to an existing chat
class AnalysisdChatMessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalysisChatMessage
        fields = ['id', 'text', 'name', 'description', 'userType', 'createdAt']

    def create(self, validated_data):
        user = self.context['request'].user
        chat = self.context['chat']
        return AnalysisChatMessage.objects.create(
            chat=chat,
            user=user,
            **validated_data
        )
