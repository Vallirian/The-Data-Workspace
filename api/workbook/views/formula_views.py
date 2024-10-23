from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from workbook.models import Formula
from workbook.serializers.formula_serializers import FormulaSerializer, FormulaValidateSerializer, FormulaMessageSerializer
from workbook.models import Workbook, DataTableMeta, FormulaMessage, DataTableColumnMeta
from django.shortcuts import get_object_or_404
from services.agents import OpenAIAnalysisAgent
from services.interface import AgentRunResponse
from services.utils import construct_sql_query
from services.db import RawSQLExecution

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
            agent_status, agent_run = agent.start_new_thread()
            if not agent_status:
                return Response({'error': agent_run}, status=status.HTTP_400_BAD_REQUEST)
            formula.threadId = agent.thread_id
            formula.save()

        agent.send_message()
        model_run: AgentRunResponse = agent.run_response
        if model_run.success:
            _new_model_message = FormulaMessage(
                user=request.user,
                formula=formula,

                userType='model',
                messageType=model_run.message_type,
                name=model_run.arc_sql.name,
                description=model_run.arc_sql.description,
                text=model_run.message,

                retries=model_run.retries,
                runDetails=model_run.run_details
            )
            _new_model_message.save()

            formula.name=model_run.arc_sql.name,
            formula.description=model_run.arc_sql.description,
            formula.arcSql = model_run.translated_sql
            formula.rawArcSql = model_run.arc_sql
            formula.save()

            return Response(FormulaMessageSerializer(_new_model_message).data, status=status.HTTP_201_CREATED)

        else:
            return Response({'error': model_run.message}, status=status.HTTP_400_BAD_REQUEST)
    
class FormulaDetailValueView(APIView):
    def get(self, request, formula_id, *args, **kwargs):
        try:
            formula = get_object_or_404(Formula, id=formula_id, isActive=True, user=request.user)
            _translated_sql = construct_sql_query(formula.rawArcSql)
            raw_sql_exec = RawSQLExecution(sql=_translated_sql, inputs=[], request=self.request)
            arc_sql_execution_pass, arc_sql_execution_result = raw_sql_exec.execute()
            if not arc_sql_execution_pass:
                return Response({'error': arc_sql_execution_result}, status=status.HTTP_400_BAD_REQUEST)
            return Response(arc_sql_execution_result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)