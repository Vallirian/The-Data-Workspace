from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from workbook.models import Workbook
from workbook.serializers.workbook_serializers import WorkbookSerializer
from django.shortcuts import get_object_or_404

class WorkbookListAPIView(APIView):
    def get(self, request):
        workbooks = Workbook.objects.filter(user=request.user).order_by('-createdAt')
        serializer = WorkbookSerializer(workbooks, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = WorkbookSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class WorkbookDetailAPIView(APIView):
    def get(self, request, workbook_id):
        workbook = get_object_or_404(Workbook, id=workbook_id, user=request.user)
        serializer = WorkbookSerializer(workbook)
        return Response(serializer.data)
