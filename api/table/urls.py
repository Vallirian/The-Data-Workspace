from django.urls import path, include
from rest_framework_nested import routers
from table.views import TableListView, ColumnListView

urlpatterns = [
    path('', TableListView.as_view(), name="table-list"),
    path('<str:table_name>/column/', ColumnListView.as_view(), name="column-list"),
]