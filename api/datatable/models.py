from django.db import models
import uuid
class DataTableMeta(models.Model):
    id = models.CharField(primary_key=True, default=uuid.uuid4, editable=False, unique=True, max_length=36)
    name = models.CharField(max_length=255)
    description = models.TextField()
    dataSourceAdded = models.BooleanField(default=False)

    DATA_SOURCE_CHOICES = [
        ('csv', 'csv'),
        (None, 'none'),
    ]
    dataSource = models.CharField(max_length=10, choices=DATA_SOURCE_CHOICES, null=True, blank=True)

    EXTRACTION_STATUS_CHOICES = [
        ('pending', 'pending'),
        ('success', 'success'),
        ('error', 'error'),
    ]
    extractionStatus = models.CharField(max_length=10, choices=EXTRACTION_STATUS_CHOICES, default='pending')

    extractionDetails = models.TextField()

    def __str__(self):
        return self.name

class DataTableColumnMeta(models.Model):
    DTYPE_CHOICES = [
        ('string', 'string'),
        ('integer', 'integer'),
        ('float', 'float'),
        ('date', 'date'),
    ]

    id = models.CharField(primary_key=True, default=uuid.uuid4, editable=False, unique=True, max_length=36)
    name = models.CharField(max_length=255)
    dtype = models.CharField(max_length=7, choices=DTYPE_CHOICES)
    format = models.CharField(max_length=100) 
    description = models.TextField()
    dataTable = models.ForeignKey(DataTableMeta, on_delete=models.CASCADE, related_name='columns')

    def __str__(self):
        return self.name
