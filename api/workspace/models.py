import uuid
from django.db import models

class Workspace(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    displayName = models.CharField(max_length=255)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    activeVersion = models.CharField(max_length=255, null=True, blank=True)
    
    def __str__(self):
        return self.displayName