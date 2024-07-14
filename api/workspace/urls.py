from workspace.views import WorkspaceViewSet
from rest_framework.routers import DefaultRouter

app_name = "workspace"
router = DefaultRouter()
router.register(r"", WorkspaceViewSet, basename="workspace")
urlpatterns = router.urls