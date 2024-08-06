from django.urls import path, include
from rest_framework_nested import routers
from table.views import TableListView, ColumnListView, TableDetailView, ColumnDetailView

urlpatterns = [
    path('', TableListView.as_view(), name="table-list"),
    path('<str:table_name>/', TableDetailView.as_view(), name="table-detail"),
    path('<str:table_name>/column/', ColumnListView.as_view(), name="column-list"),
    path('<str:table_name>/column/<str:column_name>/', ColumnDetailView.as_view(), name="column-detail"),
]