from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from workbook.models import Report, Formula
from workbook.serializers.report_serializers import ReportSerializer
from django.shortcuts import get_object_or_404
from services.interface import AgentRunResponse, ArcSQL
from services.utils import ArcSQLUtils
from workbook.serializers.formula_serializers import FormulaSerializer
from services.db import RawSQLExecution
from workbook.models import Workbook

class SharedReportListAPIView(APIView):
    def get(self, request, *args, **kwargs):
        reports = Report.objects.filter(sharedWith__contains=[request.user.email])
        serializer = ReportSerializer(reports, many=True)
        return Response(serializer.data)

class SharedReportDetailAPIView(APIView):
    def get(self, request, report_id, *args, **kwargs):
        try:
            report = Report.objects.get(id=report_id)

            # Check if the user has permission to view the report
            if request.user != report.user:
                if (request.user.email not in report.sharedWith):
                    return Response({'error': 'You do not have permission to view this report.'}, status=status.HTTP_403_FORBIDDEN)
            

            share_report = ReportSerializer(report)
            share_report_data = share_report.data
            share_report_data['formulas'] = []
            share_report_data['formulaValues'] = {}

            # get all formulas for this report
            for row in share_report_data['rows']:
                for column in row['columns']:
                    if column['formula'] and column['formula'] not in share_report_data['formulas'] and column['formula'].strip() != '':
                        formula = get_object_or_404(Formula, id=column['formula'], isActive=True)
                        serialized_formula = FormulaSerializer(formula)
                        share_report_data['formulas'].append(serialized_formula.data)

            # get all formula values for this report
            for report_formula in share_report_data['formulas']:
                formula = get_object_or_404(Formula, id=report_formula['id'], isActive=True)

                _status, _translated_sql = ArcSQLUtils(ArcSQL(**formula.rawArcSql)).get_sql_query()
                # create a temporary request object using the user from report
                _temp_request = request
                _temp_request.user = formula.user

                raw_sql_exec = RawSQLExecution(sql=_translated_sql, inputs=[], request=_temp_request)
                arc_sql_execution_pass, arc_sql_execution_result = raw_sql_exec.execute(fetch_results=True)
                if not arc_sql_execution_pass:
                    return Response({'error': arc_sql_execution_result}, status=status.HTTP_400_BAD_REQUEST)
                
                _response = None
                if len(arc_sql_execution_result) == 1:
                    _response = list(arc_sql_execution_result[0].values())[0]
                elif len(arc_sql_execution_result) > 1:
                    _response = arc_sql_execution_result
                else:
                    assert False, "No data returned"
                share_report_data['formulaValues'][report_formula['id']] = _response

            return Response(share_report_data)
        except Exception as e:
            print('error', e)
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
