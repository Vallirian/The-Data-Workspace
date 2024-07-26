from django.urls import path, include
from rest_framework_nested import routers
from table.views import TableViewSet
# from column.views import ColumnViewSet

router = routers.SimpleRouter()
router.register(r"", TableViewSet, basename="table")

table_router = routers.NestedSimpleRouter(router, r"", lookup="table")
# table_router.register(r"column", ColumnViewSet, basename="table-columns")

urlpatterns = [
    path(r'', include(router.urls)),
    path(r'', include(table_router.urls)),
]