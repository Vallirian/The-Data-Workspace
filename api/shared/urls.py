from django.urls import path
from shared.shared_report_view import SharedReportDetailAPIView

urlpatterns = [
    path('reports/<str:report_id>/', SharedReportDetailAPIView.as_view(), name='reprt-detail'),
]