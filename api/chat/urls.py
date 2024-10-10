from django.urls import path
from .views import AnalysisChatListAPIView, AnalysisChatDetailAPIView

urlpatterns = [
    path('<str:workbook_id>/table/<str:table_id>/analysis-chats/', AnalysisChatListAPIView.as_view(), name='analysis-chat-list'),
    path('<str:workbook_id>/table/<str:table_id>/analysis-chats/<str:chat_id>/', AnalysisChatDetailAPIView.as_view(), name='analysis-chat-detail'),
]