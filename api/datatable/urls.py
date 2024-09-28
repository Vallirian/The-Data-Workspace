from django.urls import path
from .views import DataTableMetaByWorkbookAPIView

urlpatterns = [
    path('<str:workbook_id>/<str:table_id>/', DataTableMetaByWorkbookAPIView.as_view(), name='datatablemeta-by-workbook'),
]
