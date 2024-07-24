import uuid
from django.db import models
from tenant.models import Tenant
from table.models import Table
from column.models import Column
from helpers import arc_utils as autils

class Relationship(models.Model):
    id = models.CharField(primary_key=True, default=autils.custom_uuid, editable=False, max_length=255)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    leftTable = models.ForeignKey(Table, on_delete=models.PROTECT, null=False, blank=False, related_name="leftTable", related_query_name="leftTable")
    rightTable = models.ForeignKey(Table, on_delete=models.PROTECT, null=False, blank=False, related_name="rightTable", related_query_name="rightTable")
    rightTableColumn = models.ForeignKey(Column, on_delete=models.PROTECT, null=False, blank=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.PROTECT, null=False, blank=False)
    
    def __str__(self):
        return self.leftTable.displayName + " - " + self.rightTable.displayName