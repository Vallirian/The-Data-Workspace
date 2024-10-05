from django.db import models
from workbook.models import Workbook
from services.pql.translate import PQLTranslator
from chat.models import AnalysisChatMessage

class Formula(models.Model):
    id = models.AutoField(primary_key=True)
    analysisMessage = models.ForeignKey(AnalysisChatMessage, on_delete=models.CASCADE, null=True, blank=True)
    workbook = models.ForeignKey(Workbook, on_delete=models.CASCADE)
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