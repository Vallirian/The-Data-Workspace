import uuid
from django.db import models
from tenant.models import Tenant
from table.models import Table

class Column(models.Model):
    dataTypeChoices = [
        ("string", "String"),
        ("number", "Number"),
        ("boolean", "Boolean"),
        ("datetime", "Datetime"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    displayName = models.CharField(max_length=255)
    description = models.CharField(max_length=255, null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    dataType = models.CharField(max_length=255, choices=dataTypeChoices)
    table = models.ForeignKey(Table, on_delete=models.PROTECT, null=False, blank=False, related_name="columns", related_query_name="column")
    tenant = models.ForeignKey(Tenant, on_delete=models.PROTECT, null=False, blank=False)
    
    def __str__(self):
        return self.displayName