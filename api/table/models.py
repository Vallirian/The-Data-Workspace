import uuid
from django.db import models
from tenant.models import Tenant
from helpers import arc_utils as autils

class Table(models.Model):
    id = models.CharField(primary_key=True, default=autils.custom_uuid, editable=False, max_length=255)
    displayName = models.CharField(max_length=255)
    description = models.CharField(max_length=255, null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    tenant = models.ForeignKey(Tenant, on_delete=models.PROTECT, null=False, blank=False)
    
    def __str__(self):
        return self.displayName