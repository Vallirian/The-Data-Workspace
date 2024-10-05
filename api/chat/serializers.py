from rest_framework import serializers
from .models import StandardChat, StandardChatMessage
from django.contrib.auth import get_user_model

User = get_user_model()

# Serializer for retrieving chat details, including nested messages (for reading)
class StandardChatSerializer(serializers.ModelSerializer):
    userId = serializers.PrimaryKeyRelatedField(source='user.id', read_only=True)
    workbookId = serializers.PrimaryKeyRelatedField(source='workbook.id', read_only=True)
    dataTableId = serializers.PrimaryKeyRelatedField(source='dataTable.id', read_only=True)

    class Meta:
        model = StandardChat
        fields = ['id', 'userId', 'workbookId', 'dataTableId']

# Serializer for creating a new chat (only requires a chat name)
class StandardChatCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StandardChat
        fields = ['id']  

    def create(self, validated_data):
        user = self.context['request'].user
        workbook = self.context['workbook']
        data_table = self.context['dataTable']

        return StandardChat.objects.create(
            user=user,
            workbook=workbook,
            dataTable=data_table,
            **validated_data
        )
    
# Serializer for retrieving messages within a chat (for reading)
class StandardChatMessageSerializer(serializers.ModelSerializer):
    userId = serializers.PrimaryKeyRelatedField(source='user.id', read_only=True)

    class Meta:
        model = StandardChatMessage
        fields = ['id', 'text', 'userId', 'userType', 'createdAt']



# Serializer for sending a message to an existing chat
class StandardChatMessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StandardChatMessage
        fields = ['id', 'text', 'userType', 'createdAt']

    def create(self, validated_data):
        user = self.context['request'].user
        chat = self.context['chat']
        return StandardChatMessage.objects.create(
            chat=chat,
            user=user,
            **validated_data
        )
