import uuid
from django.db import models
from workbook.models import Workbook

class Report(models.Model):
    id = models.CharField(primary_key=True, default=uuid.uuid4, editable=False, unique=True, max_length=36)
    rows = models.JSONField(default=list) # [[col1, col2, col3], [col1, col2, col3]]
    workbook = models.ForeignKey(Workbook, on_delete=models.CASCADE, related_name='report')

    def __str__(self):
        return self.id
        