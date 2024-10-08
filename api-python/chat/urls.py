from django.urls import path
from .analysis_views import AnalysisChatListCreateView, SendAnalysisMessageToChatView

urlpatterns = [
    path('analysis/workbook/<str:workbook_id>/table/<str:table_id>/', AnalysisChatListCreateView.as_view(), name='analysis-chat-list-create'),
    path('analysis/<str:chat_id>/', SendAnalysisMessageToChatView.as_view(), name='analysis-send-message-to-chat'),
]