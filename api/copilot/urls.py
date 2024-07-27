from django.urls import path
from copilot.views import CopilotAnalysisChat

urlpatterns = [
    path(r'analysis/', CopilotAnalysisChat.as_view(), name="copilot-analysis"),
]