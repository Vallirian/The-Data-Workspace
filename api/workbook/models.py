from django.db import models
from django.contrib.auth.models import User
import uuid

class Workbook(models.Model):
    id = models.CharField(primary_key=True, default=uuid.uuid4, editable=False, unique=True, max_length=36)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    createdAt = models.DateTimeField(auto_now_add=True)
    dataTable = models.OneToOneField('datatable.DataTableMeta', on_delete=models.CASCADE, related_name='workbook', null=True, blank=True)


    def __str__(self):
        return self.id
