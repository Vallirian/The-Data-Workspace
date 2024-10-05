from rest_framework import serializers
from .models import StandardChat, StandardChatMessage
from django.contrib.auth import get_user_model

User = get_user_model()

class StandardChatMessageSerializer(serializers.ModelSerializer):
    userId = serializers.PrimaryKeyRelatedField(source='user.id', read_only=True)
    userType = serializers.CharField(source='user_type')  # Map to match the interface key
    createdAt = serializers.DateTimeField(source='created_at')  # Map to match the interface key

    class Meta:
        model = StandardChatMessage
        fields = ['id', 'type', 'text', 'userId', 'userType', 'createdAt']

class StandardChatSerializer(serializers.ModelSerializer):
    messages = StandardChatMessageSerializer(many=True, read_only=True)  # Nested serializer for chat messages

    class Meta:
        model = StandardChat
        fields = ['id', 'name', 'messages']  # Include all fields from the interface
