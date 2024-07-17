from django.urls import path, include
from rest_framework_nested import routers
from table.views import TableViewSet

router = routers.SimpleRouter()
router.register(r"", TableViewSet, basename="table")


urlpatterns = [
    path(r'', include(router.urls)),
]