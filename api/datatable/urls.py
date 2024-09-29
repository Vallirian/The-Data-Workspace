from django.urls import path
from .views import DataTableMetaByWorkbookAPIView, DataTableExtractionAPIView

urlpatterns = [
    path('<str:workbook_id>/<str:table_id>/', DataTableMetaByWorkbookAPIView.as_view(), name='datatablemeta-by-workbook'),
    path('<str:workbook_id>/<str:table_id>/extract/', DataTableExtractionAPIView.as_view(), name='datatable-extraction'),
]
