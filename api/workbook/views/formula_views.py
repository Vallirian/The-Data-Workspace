from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from workbook.models import Formula
from workbook.serializers.formula_serializers import FormulaSerializer, FormulaValidateSerializer
from workbook.models import Workbook, DataTableMeta
from django.shortcuts import get_object_or_404
from services.db_ops.db import TranslatedPQLExecution

class FormulaListView(APIView):
    def get(self, request, workbook_id):
        workbok = get_object_or_404(Workbook, id=workbook_id, user=request.user)
        formulas = Formula.objects.filter(isActive=True, workbook=workbok).order_by('-createdAt')
        serializer = FormulaSerializer(formulas, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request, workbook_id):
        workbook = get_object_or_404(Workbook, id=workbook_id, user=request.user)
        dataTable = get_object_or_404(DataTableMeta, id=request.data.get('dataTable'), workbook=workbook, user=request.user)

        serializer = FormulaSerializer(data=request.data, context={'request': request, 'workbook': workbook, 'dataTable': dataTable})
        if serializer.is_valid():
            formula = serializer.save()
            return Response(FormulaSerializer(formula).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FormulaDetailView(APIView):
    def get(self, request, formula_id, *args, **kwargs):
        formula = get_object_or_404(Formula, id=formula_id, isActive=True, user=request.user)
        serializer = FormulaSerializer(formula)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, formula_id, *args, **kwargs):
        # DELETE (Soft delete - set isActive to False)  
        formula = get_object_or_404(Formula, id=formula_id, isActive=True, user=request.user)
        formula.isActive = False
        formula.save()
        return Response({'message': 'Formula deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    
class FormulaDetailValueView(APIView):
    def get(self, request, formula_id, *args, **kwargs):
        try:
            formula = get_object_or_404(Formula, id=formula_id, isActive=True, user=request.user)
            _translated_sql = formula.translate_pql()

            if not _translated_sql:
                return Response({'error': 'Error validating SQL'}, status=status.HTTP_400_BAD_REQUEST)
            
            _sql_executor = TranslatedPQLExecution(translated_sql=_translated_sql)
            _sql_exec_status, _sql_exec_result =_sql_executor.execute()

            assert _sql_exec_status, "SQL execution failed"
            assert _sql_exec_result, "SQL execution result not found"
            assert len(_sql_exec_result) == 1, f"Invalid SQL execution result, {_sql_exec_result}"
            assert isinstance(_sql_exec_result, list), f"Invalid SQL execution result {_sql_exec_result}"
            assert isinstance(_sql_exec_result[0], dict), f"Invalid SQL execution result {_sql_exec_result}"

            return Response({'value': list(_sql_exec_result[0].values())[0]}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)