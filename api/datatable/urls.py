from django.urls import path
from .views import DataTableMetaByWorkbookAPIView, DataTableExtractionAPIView, DataTableAPIView, DataTableMetaColumnsByWorkbookAPIView, DataTableMetaColumnsDetailByWorkbookAPIView

urlpatterns = [
    path('<str:workbook_id>/<str:table_id>/', DataTableMetaByWorkbookAPIView.as_view(), name='datatablemeta-by-workbook'),
    path('<str:workbook_id>/<str:table_id>/columns/', DataTableMetaColumnsByWorkbookAPIView.as_view(), name='datatablemeta-columns-by-workbook'),
    path('<str:workbook_id>/<str:table_id>/columns/<str:column_id>/', DataTableMetaColumnsDetailByWorkbookAPIView.as_view(), name='datatablemeta-columns-detail-by-workbook'),
    path('<str:workbook_id>/<str:table_id>/extract/', DataTableExtractionAPIView.as_view(), name='datatable-extraction'),
    path('<str:workbook_id>/<str:table_id>/raw/', DataTableAPIView.as_view(), name='datatable-raw'),
]
