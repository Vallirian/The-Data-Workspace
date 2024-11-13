from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from workbook.models import Report
from workbook.serializers.report_serializers import ReportSerializer

class ReportDetailAPIView(APIView):
    def get(self, request, workbook_id, report_id, *args, **kwargs):
        try:
            report = Report.objects.get(id=report_id, user=request.user)
            serializer = ReportSerializer(report)
            return Response(serializer.data)
        except Exception as e:
            print('error', e)
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, workbook_id, report_id, *args, **kwargs):
        report = Report.objects.get(id=report_id, user=request.user)
        serializer = ReportSerializer(report, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, workbook_id, report_id, *args, **kwargs):
        report = Report.objects.get(id=report_id, user=request.user)
        serializer = ReportSerializer(report, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response({'error': str(list(serializer.errors.values()))}, status=status.HTTP_400_BAD_REQUEST)
