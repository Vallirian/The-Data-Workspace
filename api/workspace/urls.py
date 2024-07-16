from django.urls import path, include
from rest_framework_nested import routers
from workspace.views import WorkspaceViewSet
from table.views import TableTypeViewSet

router = routers.SimpleRouter()
router.register(r"", WorkspaceViewSet, basename="workspace")

workspace_router = routers.NestedSimpleRouter(router, r"", lookup="workspace")
workspace_router.register(r"table", TableTypeViewSet, basename="workspace-table")

urlpatterns = [
    path(r'', include(router.urls)),
    path(r'', include(workspace_router.urls)),
]