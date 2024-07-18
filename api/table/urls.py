from django.urls import path, include
from rest_framework_nested import routers
from table.views import TableViewSet, RawTableView

router = routers.SimpleRouter()
router.register(r"", TableViewSet, basename="table")


urlpatterns = [
    path(r'', include(router.urls)),
    path(r'<str:table_id>/raw/', RawTableView.as_view(), name="raw_table"),
]