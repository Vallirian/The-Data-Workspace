from helpers import arc_utils as autils
from django.db import models
from tenant.models import Tenant

class CopilotMessage(models.Model):
    id = models.CharField(primary_key=True, default=autils.custom_uuid, editable=False, max_length=255)
    copilotconversation = models.ForeignKey('CopilotConversation', on_delete=models.PROTECT, null=False, blank=False)
    createdAt = models.DateTimeField(auto_now_add=True)
    message = models.TextField()
    sender = models.CharField(max_length=128)
    tenant = models.ForeignKey(Tenant, on_delete=models.PROTECT, null=False, blank=False)
    
    
    def __str__(self):
        return self.id
    
class CopilotConversation(models.Model):
    id = models.CharField(primary_key=True, default=autils.custom_uuid, editable=False, max_length=255)
    createdAt = models.DateTimeField(auto_now_add=True)
    displayName = models.CharField(max_length=255, blank=True, null=True)
    tenant = models.ForeignKey(Tenant, on_delete=models.PROTECT, null=False, blank=False)
    
    def __str__(self):
        return self.id