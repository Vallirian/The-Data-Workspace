from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from workbook.models import Formula
from workbook.serializers.formula_serializers import FormulaSerializer, FormulaValidateSerializer, FormulaMessageSerializer
from workbook.models import Workbook, DataTableMeta, FormulaMessage, DataTableColumnMeta
from django.shortcuts import get_object_or_404
from services.db_ops.db import TranslatedPQLExecution
from services.ai_chat.agents import OpenAIAnalysisAgent

class FormulaListView(APIView):
    def get(self, request, workbook_id):
        workbok = get_object_or_404(Workbook, id=workbook_id, user=request.user)
        formulas = Formula.objects.filter(isActive=True, workbook=workbok).order_by('-createdAt')
        serializer = FormulaSerializer(formulas, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request, workbook_id):
        # POST: Create a new formula (by creating a new chat)
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
    
class FormulaMessageListView(APIView):
    def get(self, request, formula_id, *args, **kwargs):
        formula = get_object_or_404(Formula, id=formula_id, user=request.user)
        messages = FormulaMessage.objects.filter(formula=formula, user=request.user).order_by('createdAt')
        serializer = FormulaMessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request, formula_id, *args, **kwargs):
        # send a message to the specified formula
        formula = get_object_or_404(Formula, id=formula_id, user=request.user)
        datatable_meta = get_object_or_404(DataTableMeta, id=formula.dataTable.id, user=request.user)

        assert datatable_meta.dataSourceAdded and datatable_meta.extractionStatus == 'success', "Data extraction not successful"

        serializer = FormulaMessageSerializer(data=request.data, context={'request': request, 'formula': formula})
        if serializer.is_valid():
            user_message = serializer.save()
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Send the message to the AI chat agent
        user_message = serializer.data.get('text')
        agent = OpenAIAnalysisAgent(user_message=user_message, chat_id=formula.id, thread_id=formula.threadId, dt_meta_id=datatable_meta.id, request=request)
        if formula.threadId is None:
            agent.start_new_thread()
            formula.threadId = agent.thread_id
            formula.save()

        model_response = agent.send_message()
        if model_response.get('success'):
            # means we have a validated + executed SQL
            _text = None
            _new_model_message = FormulaMessage(
                user=request.user,
                formula=formula,

                userType='model',
                messageType='sql',
                name=model_response.get("message").get('NAME', 'No name'),
                description=model_response.get("message").get('DESCRIPTION', 'No description'),
                arcSql=model_response.get("message"),
                text=_text,

                retries=model_response.get('retries', 0),
                fullConversation=model_response.get('full_conversation', []),
                inputToken=model_response.get('input_tokens', 0),
                outputToken=model_response.get('output_tokens', 0),
                startTime=model_response.get('start_time', None),
                endTime=model_response.get('end_time', None),
                runDetails=model_response.get('run_details', {})
            )
            _new_model_message.save()

            return Response(FormulaMessageSerializer(_new_model_message).data, status=status.HTTP_201_CREATED)
        else:
            return Response({'error': model_response.get("message", "An error occured, please try again")}, status=status.HTTP_400_BAD_REQUEST)

    
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