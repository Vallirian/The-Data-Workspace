from django.urls import path
from .standard_views import StandardChatListCreateView, SendMessageToChatView
from .analysis_views import AnalysisChatListCreateView

urlpatterns = [
    path('standard/workbook/<str:workbook_id>/table/<str:table_id>/', StandardChatListCreateView.as_view(), name='standard-chat-list-create'),
    path('standard/<str:chat_id>/', SendMessageToChatView.as_view(), name='standard-send-message-to-chat'),
    path('analysis/workbook/<str:workbook_id>/table/<str:table_id>/', AnalysisChatListCreateView.as_view(), name='analysis-chat-list-create'),
    # path('analysis/<str:chat_id>/', SendMessageToChatView.as_view(), name='send-message-to-chat'),
]