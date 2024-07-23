from django.urls import path, include
from rest_framework_nested import routers
from relationship.views import RelationshipViewset

urlpatterns = [
    path('', RelationshipViewset.as_view({'get': 'list'}), name='relationship-list'),
    path('', RelationshipViewset.as_view({'get': 'detail'}), name='relationship-detail'),
    path('<str:left_table_id>/', RelationshipViewset.as_view({'post': 'create', 'get': 'get_relationships_by_table'}), name='relationship-create'),
]