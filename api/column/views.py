from rest_framework.views import APIView 
from rest_framework.response import Response
from rest_framework import status

from django.shortcuts import get_object_or_404

from column.models import Column
from column.serializers import ColumnSerializer


class ColumnViewSet(APIView):
    serializer_class = ColumnSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.tenant:
            return Column.objects.filter(tenant=user.tenant).order_by("updatedAt")
        else:
            return Column.objects.none()
    
    def get(self, request, pk=None):
        queryset = self.get_queryset()

        ids = request.query_params.get("ids")
        if ids:
            ids = ids.split(",")
            queryset = queryset.filter(id__in=ids)

        table_id = request.query_params.get("tableId")
        if table_id:
            queryset = queryset.filter(table_id=table_id)

        if pk is None:
            # list
            serializer = ColumnSerializer(queryset, many=True)
            return Response(serializer.data)
        else:
            # detail
            column = get_object_or_404(queryset, pk=pk)
            serializer = ColumnSerializer(column)
            return Response(serializer.data)
        
    def post(self, request):
        table_pk = request.query_params.get("tableId")
        if not table_pk:
            return Response({"error": "tableId is required"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ColumnSerializer(data=request.data, context={"request": request, "table_id": table_pk})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)