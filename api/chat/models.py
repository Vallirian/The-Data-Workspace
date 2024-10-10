import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class AnalysisChat(models.Model):
    id = models.CharField(primary_key=True, default=uuid.uuid4, editable=False, unique=True, max_length=36)
    user = models.ForeignKey(User, related_name='analysis_chat', on_delete=models.CASCADE)
    workbook = models.ForeignKey('workbook.Workbook', on_delete=models.CASCADE, related_name='analysis_chat', null=True, blank=True)
    dataTable = models.ForeignKey('workbook.DataTableMeta', on_delete=models.CASCADE, related_name='analysis_chat', null=True, blank=True)
    threadId = models.CharField(max_length=64, null=True, blank=True)
    updatedAt = models.DateTimeField(auto_now=True)
    topic = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.id

class AnalysisChatMessage(models.Model):
    USER_TYPES = (
        ('user', 'user'),
        ('model', 'model')
    )

    MESSAGE_TYPES = (
        ('text', 'text'),
        ('pql', 'pql')
    )

    id = models.CharField(primary_key=True, default=uuid.uuid4, editable=False, unique=True, max_length=36)
    chat = models.ForeignKey(AnalysisChat, related_name='analysis_messages', on_delete=models.CASCADE)  
    user = models.ForeignKey(User, on_delete=models.CASCADE)  
    userType = models.CharField(max_length=5, choices=USER_TYPES)  
    createdAt = models.DateTimeField(auto_now_add=True)  
    
    text = models.TextField(blank=True, null=True)  
    pql = models.JSONField(blank=True, null=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    messageType = models.CharField(max_length=5, choices=MESSAGE_TYPES, default='text')

    retries = models.IntegerField(default=0)
    fullConversation = models.JSONField(default=list)
    inputToken = models.IntegerField(default=0)
    outputToken = models.IntegerField(default=0)

    def __str__(self):
        return f'{self.user.username}: {self.text[:50]}'