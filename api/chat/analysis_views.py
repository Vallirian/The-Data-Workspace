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
        print('agent response', response)
        
        print('response', response)
        if response.get('success'):
            pass
    #         # Save the message to the database
    #         _new_model_message = StandardChatMessage(
    #             chat=chat,
    #             text=response.get('message'),
    #             user=request.user,
    #             userType='model'
    #         )
    #         _new_model_message.save()

    #         return Response(StandardChatMessageCreateSerializer(_new_model_message).data, status=status.HTTP_201_CREATED)
    #     else:
        return Response({'error': response.get('message')}, status=status.HTTP_400_BAD_REQUEST)

