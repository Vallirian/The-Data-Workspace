from django.urls import path, include
from rest_framework_nested import routers
from table.views import TableListView, ColumnListView, TableDetailView

urlpatterns = [
    path('', TableListView.as_view(), name="table-list"),
    path('<str:table_name>/', TableDetailView.as_view(), name="table-detail"),
    path('<str:table_name>/column/', ColumnListView.as_view(), name="column-list"),
]