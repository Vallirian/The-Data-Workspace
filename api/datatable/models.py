from django.db import models
import uuid
class DataTableMeta(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4().hex, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField()
    dataSourceAdded = models.BooleanField(default=False)

    DATA_SOURCE_CHOICES = [
        ('csv', 'CSV'),
        (None, 'NONE'),
    ]
    dataSource = models.CharField(max_length=10, choices=DATA_SOURCE_CHOICES, null=True, blank=True)

    EXTRACTION_STATUS_CHOICES = [
        ('pending', 'PEDNING'),
        ('success', 'SUCCESS'),
        ('error', 'ERROR'),
    ]
    extractionStatus = models.CharField(max_length=10, choices=EXTRACTION_STATUS_CHOICES, default='pending')

    extractionDetails = models.TextField()
    columns = models.ManyToManyField('DataTableColumnMeta')

    def __str__(self):
        return self.name

class DataTableColumnMeta(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4().hex, editable=False)
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name
