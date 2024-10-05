from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import AnalysisChat, AnalysisChatMessage
from workbook.models import Workbook
from datatable.models import DataTableMeta, DataTableColumnMeta
from django.shortcuts import get_object_or_404
from .analysis_serializers import (
    AnalysisChatSerializer,
    AnalysisChatCreateSerializer,
    AnalysisdChatMessageCreateSerializer
)
from services.ai_chat.agents import OpenAIAnalysisAgent
from services.pql.translate import PQLTranslator
from services.db_ops.db import TranslatedPQLExecution


# List all chats or create a new chat using APIView
class AnalysisChatListCreateView(APIView):
    # GET: List all chats for the authenticated user, workbook, and data table
    def get(self, request, workbook_id, table_id): 
        workbook = get_object_or_404(Workbook, id=workbook_id, user=request.user)
        data_table_meta = get_object_or_404(DataTableMeta, workbook=workbook, id=table_id)
        chats = AnalysisChat.objects.filter(user=request.user, workbook=workbook, dataTable=data_table_meta).order_by('-updatedAt')

        serializer = AnalysisChatSerializer(chats, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # POST: Create a new chat for a specific workbook and data table
    def post(self, request, workbook_id, table_id):
        workbook = get_object_or_404(Workbook, id=workbook_id, user=request.user)
        data_table_meta = get_object_or_404(DataTableMeta, workbook=workbook, id=table_id)
        
        serializer = AnalysisChatCreateSerializer(data=request.data, context={
            'request': request,
            'workbook': workbook,
            'dataTable': data_table_meta
        })
        
        if serializer.is_valid():
            chat = serializer.save()
            return Response(AnalysisChatSerializer(chat).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# Send a message to a chat using APIView
class SendAnalysisMessageToChatView(APIView):
    # GET: list all messages in the specified chat
    def get(self, request, chat_id):
        chat = get_object_or_404(AnalysisChat, id=chat_id, user=request.user)
        messages = AnalysisChatMessage.objects.filter(chat=chat).order_by('createdAt')
        serializer = AnalysisdChatMessageCreateSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

    # POST: Send a message to the specified chat
    def post(self, request, chat_id):
        # get chat
        try:
            chat = AnalysisChat.objects.get(id=chat_id, user=request.user)

            # assert data exists
            data_table = get_object_or_404(DataTableMeta, workbook=chat.workbook, id=chat.dataTable.id)
            if not data_table:
                return Response({'error': 'Data not found for workbook, please complete data extraction before analysis'}, status=status.HTTP_404_NOT_FOUND)
            if not data_table.dataSourceAdded:
                return Response({'error': 'Data source not added, please complete data extraction before analysis'}, status=status.HTTP_400_BAD_REQUEST)
            if not data_table.extractionStatus == 'success':
                return Response({'error': 'Data extraction was not succesful, please complete data extraction before analysis'}, status=status.HTTP_400_BAD_REQUEST)
            

            if chat.topic is None:
                chat.topic = request.data.get('text')
            chat.save()
        except Exception as e:
            return Response({'error': 'Chat not found'}, status=status.HTTP_404_NOT_FOUND)
        
        assert chat, "Chat not found"

        # Deserialize and validate the message payload
        serializer = AnalysisdChatMessageCreateSerializer(
            data=request.data,
            context={'request': request, 'chat': chat}
        )

        if serializer.is_valid():
            serializer.save()
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # generate table and column information
        try:
            data_table_meta = get_object_or_404(DataTableMeta, workbook=chat.workbook, id=chat.dataTable.id)
        except Exception as e:
            return Response({'error': 'Data table not found'}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            data_table_column_meta = DataTableColumnMeta.objects.filter(dataTable=data_table_meta)
        except Exception as e:
            return Response({'error': 'Data table columns not found'}, status=status.HTTP_404_NOT_FOUND)
        
        _table_information = f"""Table information:
        Table name: {data_table_meta.name}
        Table description: {data_table_meta.description}
        Table datasource: {data_table_meta.dataSource}
        Table extraction status: {data_table_meta.extractionStatus}
        Table extraction details: {data_table_meta.extractionDetails}"""

        _column_information = "Column information:\n"
        for column in data_table_column_meta:
            _column_information += f"""Column name: {column.name}
            Column description: {column.description}
            Column data type: {column.dtype}"""

        # Send the message to the AI chat agent
        user_message = serializer.data.get('text')
        agent = OpenAIAnalysisAgent(user_message=user_message, chat_id=chat.id, thread_id=chat.threadId)

        if chat.threadId is None:
            agent.start_new_thread()
            chat.threadId = agent.thread_id
            chat.save()

        assert agent.thread_id, "Chat thread ID not found"

            
        # Send the message to the AI chat agent
        response = agent.send_message(table_informaiton=_table_information, column_informaion=_column_information)
        
        if response.get('success'):
            _pql_from_model = response.get('message')
            assert _pql_from_model, "PQL not found"
            assert isinstance(_pql_from_model, dict), "PQL is not a dictionary"

            # switch pql.table to the actual table name
            _pql_from_model['TABLE'] = f'table___{data_table_meta.id}'

            # Translate the PQL to SQL
            _sql_translator = PQLTranslator(pql=_pql_from_model)
            _sql_translator.translate()

            if _sql_translator.errors:
                return Response({'error': 'An error occured, please try again'}, status=status.HTTP_400_BAD_REQUEST)
            
            print('sql', _sql_translator.translated_pql)
            # Execute the SQL query
            _sql_executor = TranslatedPQLExecution(translated_sql=_sql_translator.translated_pql)
            _sql_exec_status, _sql_exec_result =_sql_executor.execute()
            print('sql exec status', _sql_exec_status, _sql_exec_result)

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
                sql = _sql_translator.translated_pql,
                name="",
                description=""
            )
            _new_model_message.save()

            return Response(AnalysisdChatMessageCreateSerializer(_new_model_message).data, status=status.HTTP_201_CREATED)
        else:
            return Response({'error': response.get('message')}, status=status.HTTP_400_BAD_REQUEST)

