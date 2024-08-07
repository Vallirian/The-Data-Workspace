from django.urls import path
from process.views import ProcessListView, ProcessTableRelationshipListView

urlpatterns = [
    path('', ProcessListView.as_view(), name="process-list"),
    path('<str:process_name>/', ProcessTableRelationshipListView.as_view(), name="process-table-relationship-list"),
]