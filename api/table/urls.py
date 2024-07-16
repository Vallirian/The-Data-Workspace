from table.views import TableTypeViewSet
from rest_framework.routers import DefaultRouter

app_name = "table"
router = DefaultRouter()
router.register(r"", TableTypeViewSet, basename="table")
# router.register(r"workspace/(?P<workspaceId>[^/.]+)/table", TableTypeViewSet, basename="table")
urlpatterns = router.urls