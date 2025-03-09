import uuid
from django.db import models
from user.models import ArcUser
from services.helpers.utils import generate_random_workspace_name

class Workspace(models.Model):
    id = models.CharField(primary_key=True, default=uuid.uuid4, editable=False, unique=True, max_length=36)
    user = models.ForeignKey(ArcUser, on_delete=models.CASCADE)
    name = models.CharField(max_length=255, default=generate_random_workspace_name)
    created = models.DateTimeField(auto_now_add=True)
    lastModified = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'workspace'