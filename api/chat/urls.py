from django.urls import path
from . views import StandardChatListCreateView, SendMessageToChatView

urlpatterns = [
    path('workbook/<str:workbook_id>/table/<str:table_id>/', StandardChatListCreateView.as_view(), name='standard-chat-list-create'),
    path('<str:chat_id>/', SendMessageToChatView.as_view(), name='send-message-to-chat'),
]