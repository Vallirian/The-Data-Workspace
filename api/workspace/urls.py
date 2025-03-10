from django.urls import path
from .view_workspace import WorkspaceListCreateAPIView
from .view_tablemetadata import TableMetaDataListCreateAPIView, TableMetaDataDetailAPIView

urlpatterns = [
    # workspace
    path('', WorkspaceListCreateAPIView.as_view(), name='workspaces'),
    path('<str:workspace_id>/tables/', TableMetaDataListCreateAPIView.as_view(), name='workspace-tables'),
    path('<str:workspace_id>/tables/<str:table_id>/', TableMetaDataDetailAPIView.as_view(), name='workspace-tables'),
]