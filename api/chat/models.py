import uuid
from django.db import models
from django.contrib.auth import get_user_model
from workbook.models import Workbook
from datatable.models import DataTableMeta

User = get_user_model()

class StandardChat(models.Model):
    id = models.CharField(primary_key=True, default=uuid.uuid4, editable=False, unique=True, max_length=36)
    user = models.ForeignKey(User, related_name='standard_chat', on_delete=models.CASCADE)
    workbook = models.ForeignKey(Workbook, related_name='standard_chat', on_delete=models.CASCADE)
    dataTable = models.ForeignKey(DataTableMeta, on_delete=models.CASCADE, related_name='standard_chat', null=True, blank=True)
    threadId = models.CharField(max_length=64, null=True, blank=True)
    updatedAt = models.DateTimeField(auto_now=True)
    topic = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.id

class StandardChatMessage(models.Model):
    MESSAGE_TYPES = (
        ('user', 'User'),
        ('model', 'Model'),
    )

    id = models.CharField(primary_key=True, default=uuid.uuid4, editable=False, unique=True, max_length=36)
    chat = models.ForeignKey(StandardChat, related_name='standard_messages', on_delete=models.CASCADE)  
    text = models.TextField()  
    user = models.ForeignKey(User, on_delete=models.CASCADE)  
    userType = models.CharField(max_length=5, choices=MESSAGE_TYPES)  
    createdAt = models.DateTimeField(auto_now_add=True)  

    def __str__(self):
        return f'{self.user.username}: {self.text[:50]}'
