import uuid
from django.db import models
from user.models import ArcUser
from services.helpers.utils import generate_random_workspace_name

class Analysis(models.Model):
    id = models.CharField(primary_key=True, default=uuid.uuid4, editable=False, unique=True, max_length=36)
    user = models.ForeignKey(ArcUser, on_delete=models.CASCADE)
    name = models.CharField(max_length=255, blank=True, null=True)
    useCase = models.TextField()
    created = models.DateTimeField(auto_now_add=True)
    lastModified = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'analysis'

class Workspace(models.Model):
    id = models.CharField(primary_key=True, default=uuid.uuid4, editable=False, unique=True, max_length=36)
    user = models.ForeignKey(ArcUser, on_delete=models.CASCADE)
    name = models.CharField(max_length=255, default=generate_random_workspace_name)
    created = models.DateTimeField(auto_now_add=True)
    lastModified = models.DateTimeField(auto_now=True)
    analysis = models.ForeignKey(Analysis, on_delete=models.CASCADE, blank=True, null=True, related_name='workspaces')
    tableMetadata = models.OneToOneField('TableMetaData', on_delete=models.CASCADE, blank=True, null=True, related_name='workspace')

    class Meta:
        db_table = 'workspace'

class TableMetaData(models.Model):
    STATUS_CHOICES = [
        ('not-processed', 'Not-processed'),
        ('preprocessed', 'Preprocessed'),
        ('issues', 'Issues'),
    ]

    id = models.CharField(primary_key=True, default=uuid.uuid4, editable=False, unique=True, max_length=36)
    tableName = models.CharField(max_length=255)
    columns = models.JSONField(default=list)
    created = models.DateTimeField(auto_now_add=True)
    lastModified = models.DateTimeField(auto_now=True)
    totalIssues = models.IntegerField(default=0)
    issuesResolved = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='issues')

    class Meta:
        db_table = 'table_metadata'