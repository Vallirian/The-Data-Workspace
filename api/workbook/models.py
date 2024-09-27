from django.db import models
from django.contrib.auth.models import User
import uuid

class Workbook(models.Model):
    id = models.UUIDField(primary_key=True, max_length=32, default=uuid.uuid4().hex, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.id
