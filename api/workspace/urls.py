from django.urls import path
from .view_workspace import WorkspaceListCreateAPIView
from .view_preprocess import ProfileAPIView, TableMetaDataListCreateAPIView, TableMetaDataDetailAPIView

urlpatterns = [
    # workspace
    path('', WorkspaceListCreateAPIView.as_view(), name='workspaces'),
    path('<str:workspace_id>/tables/', TableMetaDataListCreateAPIView.as_view(), name='workspace-tables'),
    path('<str:workspace_id>/tables/<str:table_id>/', TableMetaDataDetailAPIView.as_view(), name='workspace-tables'),
    path('<str:workspace_id>/tables/<str:table_id>/data-profiles/<str:profile_type>/', ProfileAPIView.as_view(), name='workspace-profiles'),
]