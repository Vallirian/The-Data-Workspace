from django.urls import path
from shared.shared_report_view import SharedReportDetailAPIView, SharedReportListAPIView

urlpatterns = [
    path('reports/', SharedReportListAPIView.as_view(), name='report-list'),
    path('reports/<str:report_id>/', SharedReportDetailAPIView.as_view(), name='report-detail'),
]