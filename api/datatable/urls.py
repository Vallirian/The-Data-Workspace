from django.urls import path
from .views import DataTableMetaByWorkbookAPIView

urlpatterns = [
    path('', DataTableMetaByWorkbookAPIView.as_view(), name='datatablemeta-by-workbook'),
]
