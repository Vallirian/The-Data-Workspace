from django.urls import re_path
from copilot import consumers

websocket_urlpatterns = [
    re_path(r'ws/analysis-chat/', consumers.CopilotChatConsumer.as_asgi()),
]