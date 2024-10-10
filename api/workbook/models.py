from django.db import models
from user.models import ArcUser
import uuid
from services.pql.translate import PQLTranslator
from chat.models import AnalysisChatMessage

class DataTableMeta(models.Model):
    id = models.CharField(primary_key=True, default=uuid.uuid4, editable=False, unique=True, max_length=36)
    user = models.ForeignKey(ArcUser, on_delete=models.CASCADE)
    name = models.CharField(max_length=255, default='Untitled Table')
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
    user = models.ForeignKey(ArcUser, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    dtype = models.CharField(max_length=7, choices=DTYPE_CHOICES)
    format = models.CharField(max_length=100, blank=True, null=True) 
    order = models.PositiveIntegerField()
    description = models.TextField()
    dataTable = models.ForeignKey(DataTableMeta, on_delete=models.CASCADE, related_name='columns')

    def __str__(self):
        return self.name

class Report(models.Model):
    id = models.CharField(primary_key=True, default=uuid.uuid4, editable=False, unique=True, max_length=36)
    user = models.ForeignKey(ArcUser, on_delete=models.CASCADE)
    rows = models.JSONField(default=list) # [[col1, col2, col3], [col1, col2, col3]]

    def __str__(self):
        return self.id
    
class Formula(models.Model):
    id = models.CharField(primary_key=True, default=uuid.uuid4, editable=False, unique=True, max_length=36)
    analysisMessage = models.ForeignKey(AnalysisChatMessage, on_delete=models.CASCADE, null=True, blank=True)
    workbook = models.ForeignKey('Workbook', on_delete=models.CASCADE)
    user = models.ForeignKey(ArcUser, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField()
    pql = models.JSONField()
    isActive = models.BooleanField(default=True)
    isValidated = models.BooleanField(default=False)
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    def translate_pql(self):
        _sql_translator = PQLTranslator(pql=self.pql)
        _sql_translator.translate()

        assert not _sql_translator.errors, "PQL translation failed"

        return _sql_translator.translated_pql

class Workbook(models.Model):
    id = models.CharField(primary_key=True, default=uuid.uuid4, editable=False, unique=True, max_length=36)
    user = models.ForeignKey(ArcUser, on_delete=models.CASCADE)
    createdAt = models.DateTimeField(auto_now_add=True)
    dataTable = models.OneToOneField(DataTableMeta, on_delete=models.CASCADE, related_name='workbook', null=True, blank=True)
    report = models.OneToOneField(Report, on_delete=models.CASCADE, related_name='workbook', null=True, blank=True)


    def __str__(self):
        return self.id

