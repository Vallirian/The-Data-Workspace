import uuid
from django.db import models
from user.models import ArcUser

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


class Report(models.Model):
    id = models.CharField(primary_key=True, default=uuid.uuid4, editable=False, unique=True, max_length=36)
    user = models.ForeignKey(ArcUser, on_delete=models.CASCADE)
    rows = models.JSONField(default=list) # [[col1, col2, col3], [col1, col2, col3]]

    
class Formula(models.Model):
    id = models.CharField(primary_key=True, default=uuid.uuid4, editable=False, unique=True, max_length=36)
    user = models.ForeignKey(ArcUser, on_delete=models.CASCADE)
    workbook = models.ForeignKey('Workbook', on_delete=models.CASCADE)
    dataTable = models.ForeignKey(DataTableMeta, on_delete=models.CASCADE, related_name='formula', null=True, blank=True)
    
    threadId = models.CharField(max_length=64, null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    name = models.CharField(max_length=255)
    description = models.TextField()
    arcSql = models.JSONField(blank=True, null=True)
    isActive = models.BooleanField(default=True)
    isValidated = models.BooleanField(default=False)

    
class FormulaMessage(models.Model):
    USER_TYPES = (
        ('user', 'user'),
        ('model', 'model')
    )

    MESSAGE_TYPES = (
        ('text', 'text'),
        ('sql', 'sql')
    )

    id = models.CharField(primary_key=True, default=uuid.uuid4, editable=False, unique=True, max_length=36)
    user = models.ForeignKey(ArcUser, on_delete=models.CASCADE)
    formula = models.ForeignKey(Formula, on_delete=models.CASCADE)
    createdAt = models.DateTimeField(auto_now_add=True)

    userType = models.CharField(max_length=5, choices=USER_TYPES)  
    messageType = models.CharField(max_length=5, choices=MESSAGE_TYPES, default='text')
    name = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    arcSql = models.JSONField(blank=True, null=True)
    text = models.TextField(blank=True, null=True)

    retries = models.IntegerField(default=0)
    fullConversation = models.JSONField(default=list)
    inputToken = models.IntegerField(default=0)
    outputToken = models.IntegerField(default=0)
    startTime = models.DateTimeField(blank=True, null=True)
    endTime = models.DateTimeField(blank=True, null=True)
    runDetails = models.JSONField(default=dict)


class Workbook(models.Model):
    id = models.CharField(primary_key=True, default=uuid.uuid4, editable=False, unique=True, max_length=36)
    user = models.ForeignKey(ArcUser, on_delete=models.CASCADE)
    createdAt = models.DateTimeField(auto_now_add=True)
    dataTable = models.OneToOneField(DataTableMeta, on_delete=models.CASCADE, related_name='workbook', null=True, blank=True)
    report = models.OneToOneField(Report, on_delete=models.CASCADE, related_name='workbook', null=True, blank=True)

