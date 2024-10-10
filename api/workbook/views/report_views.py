from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from workbook.models import Report
from workbook.serializers.report_serializers import ReportSerializer

class ReportDetailAPIView(APIView):
    def get(self, request, report_id):
        report = Report.objects.get(id=report_id, user=request.user)
        serializer = ReportSerializer(report)
        return Response(serializer.data)

    def put(self, request, report_id):
        report = Report.objects.get(id=report_id, user=request.user)
        serializer = ReportSerializer(report, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
