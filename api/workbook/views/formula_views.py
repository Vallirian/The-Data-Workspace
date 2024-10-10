from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from workbook.models import Formula
from workbook.serializers.formula_serializers import FormulaSerializer, FormulaValidateSerializer
from workbook.models import Workbook
from chat.models import AnalysisChatMessage
from django.shortcuts import get_object_or_404
from services.db_ops.db import TranslatedPQLExecution

class FormulaListView(APIView):
    def get(self, request, workbook_id):
        workbok = get_object_or_404(Workbook, id=workbook_id, user=request.user)
        formulas = Formula.objects.filter(isActive=True, workbook=workbok).order_by('-createdAt')
        serializer = FormulaSerializer(formulas, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request, workbook_id):
        if request.data is None:
            return Response({'error': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)
        if 'chatId' not in request.data:
            return Response({'error': 'Chat ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # get message
        messageId = request.data['messageId']
        analysisMessage = get_object_or_404(AnalysisChatMessage, id=messageId)
        if (analysisMessage.messageType != 'pql') or (analysisMessage.pql is None):
            return Response({'error': 'This message can not be saved as formula'}, status=status.HTTP_400_BAD_REQUEST)
        
        # check if formula already exists
        formula = Formula.objects.filter(analysisMessage=analysisMessage, isActive=True)
        if formula.exists():
            return Response({'error': 'This formula already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        # create new formula      
        try: 
            workbook = get_object_or_404(Workbook, id=workbook_id, user=request.user)
            formula = Formula.objects.create(
                workbook=workbook,
                analysisMessage=analysisMessage,
                name=analysisMessage.pql.get('NAME', 'No name'),
                description=analysisMessage.pql.get('DESCRIPTION', 'No description'),
                pql=analysisMessage.pql,
            )
            formula.save()
            return Response({'message': 'Formula created successfully'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': 'Error creating formula'}, status=status.HTTP_400_BAD_REQUEST)

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