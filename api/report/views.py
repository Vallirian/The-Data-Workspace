from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Report
from .serializers import ReportSerializer
from workbook.models import Workbook

class ReportDetailAPIView(APIView):
    def get(self, request, workbook_id):
        workbook = Workbook.objects.get(id=workbook_id, user=request.user)

        # Use get_or_create to avoid race conditions
        report, created = Report.objects.get_or_create(workbook=workbook)

        serializer = ReportSerializer(report)
        return Response(serializer.data)

    def put(self, request, workbook_id):
        print(request.data)
        workbook = Workbook.objects.get(id=workbook_id, user=request.user)

        # Use get_or_create to avoid race conditions
        report, created = Report.objects.get_or_create(workbook=workbook)

        serializer = ReportSerializer(report, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
