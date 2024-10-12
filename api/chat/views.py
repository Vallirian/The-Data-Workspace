from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import AnalysisChat, AnalysisChatMessage
from workbook.models import Workbook
from workbook.models import DataTableMeta, DataTableColumnMeta
from django.shortcuts import get_object_or_404
from .serializers import (
    AnalysisChatSerializer,
    AnalysisChatMessageSerializer
)
from services.ai_chat.agents import OpenAIAnalysisAgent
from services.pql.translate import PQLTranslator
from services.db_ops.db import TranslatedPQLExecution

class AnalysisChatListAPIView(APIView):
    def get(self, request, workbook_id, table_id, *args, **kwargs): 
        workbook = get_object_or_404(Workbook, id=workbook_id, user=request.user)
        data_table_meta = get_object_or_404(DataTableMeta, workbook=workbook, id=table_id)
        chats = AnalysisChat.objects.filter(user=request.user, workbook=workbook, dataTable=data_table_meta).order_by('-updatedAt')

        serializer = AnalysisChatSerializer(chats, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, workbook_id, table_id, *args, **kwargs):
        workbook = Workbook.objects.get(id=workbook_id, user=request.user)
        data_table_meta = DataTableMeta.objects.get(id=table_id, workbook=workbook)
        
        serializer = AnalysisChatSerializer(data=request.data, context={
            'request': request,
            'workbook': workbook,
            'dataTable': data_table_meta
        })
        
        if serializer.is_valid():
            chat = serializer.save()
            return Response(AnalysisChatSerializer(chat).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AnalysisChatDetailAPIView(APIView):
    def get(self, request, chat_id, *args, **kwargs):
        chat = get_object_or_404(AnalysisChat, id=chat_id, user=request.user)
        messages = AnalysisChatMessage.objects.filter(chat=chat, user=request.user).order_by('createdAt')
        serializer = AnalysisChatMessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # POST: Send a message to the specified chat
    def post(self, request, table_id, chat_id, *args, **kwargs):
        try:
            datatable_meta = get_object_or_404(DataTableMeta, id=table_id, user=request.user)
            datatable_column_meta = DataTableColumnMeta.objects.filter(dataTable=datatable_meta)

            # assert data exists
            if not datatable_meta:
                return Response({'error': 'Data not found for workbook, please complete data extraction before analysis'}, status=status.HTTP_404_NOT_FOUND)
            if not datatable_meta.dataSourceAdded:
                return Response({'error': 'Data source not added, please complete data extraction before analysis'}, status=status.HTTP_400_BAD_REQUEST)
            if not datatable_meta.extractionStatus == 'success':
                return Response({'error': 'Data extraction was not succesful, please complete data extraction before analysis'}, status=status.HTTP_400_BAD_REQUEST)
            if not datatable_column_meta:
                return Response({'error': 'Data table columns not found'}, status=status.HTTP_404_NOT_FOUND)
            
            chat = AnalysisChat.objects.get(id=chat_id, dataTable=datatable_meta, user=request.user)
            if chat.topic is None:
                chat.topic = request.data.get('text')
                chat.save()

        except Exception as e:
            print(e)
            return Response({'error': 'Chat not found'}, status=status.HTTP_404_NOT_FOUND)

        # Deserialize and validate the message payload
        serializer = AnalysisChatMessageSerializer(
            data=request.data,
            context={'request': request, 'chat': chat}
        )
        if serializer.is_valid():
            serializer.save()
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the table and column information
        _table_information = f"""Table information:\n
        Table name: {datatable_meta.name}\n
        Table description: {datatable_meta.description}\n
        Table datasource: {datatable_meta.dataSource}\n
        Table extraction status: {datatable_meta.extractionStatus}\n
        Table extraction details: {datatable_meta.extractionDetails}\n"""

        _column_information = "Column information:\n"
        for column in datatable_column_meta:
            _column_information += f"""Column name: {column.name}\n
            Column description: {column.description}\n
            Column data type: {column.dtype}\n"""

        # Send the message to the AI chat agent
        user_message = serializer.data.get('text')
        agent = OpenAIAnalysisAgent(user_message=user_message, chat_id=chat.id, thread_id=chat.threadId)

        if chat.threadId is None:
            agent.start_new_thread()
            chat.threadId = agent.thread_id
            chat.save()
            
        response = agent.send_message(table_informaiton=_table_information, column_informaion=_column_information)
        
        if response.get('success'):
            _pql_from_model = response.get('message')
            assert _pql_from_model, "PQL not found"
            assert isinstance(_pql_from_model, dict), "PQL is not a dictionary"

            # switch pql.table to the actual table name
            _pql_from_model['TABLE'] = f'table___{datatable_meta.id}'

            # Translate the PQL to SQL
            _sql_translator = PQLTranslator(pql=_pql_from_model)
            _sql_translator.translate()

            if _sql_translator.errors:
                return Response({'error': 'An error occured, please try again'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Execute the SQL query
            _sql_executor = TranslatedPQLExecution(translated_sql=_sql_translator.translated_pql)
            _sql_exec_status, _sql_exec_result =_sql_executor.execute()

            assert _sql_exec_status, "SQL execution failed"
            assert _sql_exec_result, "SQL execution result not found"
            assert len(_sql_exec_result) == 1, f"Invalid SQL execution result, {_sql_exec_result}"
            assert isinstance(_sql_exec_result, list), f"Invalid SQL execution result {_sql_exec_result}"
            assert isinstance(_sql_exec_result[0], dict), f"Invalid SQL execution result {_sql_exec_result}"

            # Save the message to the database
            _new_model_message = AnalysisChatMessage(
                chat=chat,
                user=request.user,
                userType='model',
                text=list(_sql_exec_result[0].values())[0],
                pql=_pql_from_model,
                name=_pql_from_model.get('NAME', 'No name'),
                description=_pql_from_model.get('DESCRIPTION', 'No description'),
                messageType='pql',
                fullConversation=response.get('full_conversation', []),
                inputToken=response.get('input_tokens', 0),
                outputToken=response.get('output_tokens', 0),
                retries=response.get('retries', 0)
            )
            _new_model_message.save()

            return Response(AnalysisChatMessageSerializer(_new_model_message).data, status=status.HTTP_201_CREATED)
        else:
            return Response({'error': response.get('message')}, status=status.HTTP_400_BAD_REQUEST)

