import uuid
from django.db import models
from tenant.models import Tenant

class Workspace(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    displayName = models.CharField(max_length=255)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    activeVersion = models.CharField(max_length=255, null=True, blank=True)
    tenant = models.ForeignKey(Tenant, on_delete=models.PROTECT, null=False, blank=False)
    
    def __str__(self):
        return self.displayName