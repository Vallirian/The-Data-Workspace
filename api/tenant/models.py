import uuid
from django.db import models
from helpers import arc_utils as autils

class Tenant(models.Model):
    id = models.CharField(primary_key=True, default=autils.custom_uuid, editable=False, max_length=255)
    displayName = models.CharField(max_length=255)
    createdAt = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.displayName