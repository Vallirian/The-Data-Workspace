from django.urls import path
from .views import WorkbookListAPIView, WorkbookDetailAPIView

urlpatterns = [
    path('', WorkbookListAPIView.as_view(), name='workbook-list'), 
    path('<str:pk>/', WorkbookDetailAPIView.as_view(), name='workbook-detail'),  
]