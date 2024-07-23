from relationship.models import Relationship
from relationship.serializers import RelationshipSerializer
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from django.shortcuts import get_object_or_404
from table.models import Table


# Create your views here.
class RelationshipViewset(viewsets.ModelViewSet):
    serializer_class = RelationshipSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.tenant:
            return Relationship.objects.filter(tenant=user.tenant)
        else:
            return Relationship.objects.none()
        
    def get_object(self):
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, pk=self.kwargs["pk"])
        return obj
    
    def list(self, request):
        queryset = self.get_queryset()
        serializer = RelationshipSerializer(queryset, many=True)
        return Response(serializer.data)
    
    def detail(self, request):
        relationship = self.get_object()
        serializer = RelationshipSerializer(relationship)
        return Response(serializer.data)
    
    def create(self, request, left_table_id):
        serializer = RelationshipSerializer(data=request.data, context={"request": request, "left_table_id": left_table_id})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # actions
    @action(detail=False, methods=["get"])
    def get_relationships_by_table(self, request, left_table_id):
        left_table = Table.objects.get(id=left_table_id)
        relationships = Relationship.objects.filter(leftTable=left_table)
        serializer = RelationshipSerializer(relationships, many=True)
        return Response(serializer.data)