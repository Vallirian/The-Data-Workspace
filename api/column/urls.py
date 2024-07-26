from django.urls import path, include
from rest_framework_nested import routers
from column.views import ColumnViewSet

urlpatterns = [
    path("", ColumnViewSet.as_view(), name="column-list"),
    path("<str:pk>/", ColumnViewSet.as_view(), name="column-detail"),
]