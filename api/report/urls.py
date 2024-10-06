from django.urls import path
from .views import ReportDetailAPIView

urlpatterns = [
    path('workbook/<str:workbook_id>/', ReportDetailAPIView.as_view(), name='report-detail'),
]