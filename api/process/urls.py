from django.urls import path, include
from rest_framework_nested import routers
from process.views import ProcessListView, ProcessTableRelationshipListView

urlpatterns = [
    path('', ProcessListView.as_view(), name="process-list"),
    path('<str:process_id>/', ProcessTableRelationshipListView.as_view(), name="process-table-relationship-list"),
]