import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class StandardChat(models.Model):
    id = models.CharField(primary_key=True, default=uuid.uuid4, editable=False, unique=True, max_length=36)
    name = models.CharField(max_length=255)  

    def __str__(self):
        return self.name

class StandardChatMessage(models.Model):
    MESSAGE_TYPES = (
        ('user', 'User'),
        ('model', 'Model'),
    )

    id = models.CharField(primary_key=True, default=uuid.uuid4, editable=False, unique=True, max_length=36)
    chat = models.ForeignKey(StandardChat, related_name='standard_messages', on_delete=models.CASCADE)  
    text = models.TextField()  
    user = models.ForeignKey(User, on_delete=models.CASCADE)  
    user_type = models.CharField(max_length=5, choices=MESSAGE_TYPES)  
    created_at = models.DateTimeField(auto_now_add=True)  

    def __str__(self):
        return f'{self.user.username}: {self.text[:50]}'
