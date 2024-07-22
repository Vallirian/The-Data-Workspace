import uuid
from django.db import models
from tenant.models import Tenant
from table.models import Table
from column.models import Column

class Relationship(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    leftTable = models.ForeignKey(Table, on_delete=models.PROTECT, null=False, blank=False, related_name="left_table", related_query_name="left_table")
    rightTable = models.ForeignKey(Table, on_delete=models.PROTECT, null=False, blank=False, related_name="right_table", related_query_name="right_table")
    rightTableColumn = models.ForeignKey(Column, on_delete=models.PROTECT, null=False, blank=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.PROTECT, null=False, blank=False)
    
    def __str__(self):
        return self.leftTable.displayName + " - " + self.rightTable.displayName