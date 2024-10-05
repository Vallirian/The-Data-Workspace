from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import StandardChat, StandardChatMessage
from workbook.models import Workbook
from datatable.models import DataTableMeta
from django.shortcuts import get_object_or_404
from .serializers import (
    StandardChatSerializer,
    StandardChatCreateSerializer,
    StandardChatMessageCreateSerializer
)
from services.ai_chat.agents import OpenAIStandardAgent


# List all chats or create a new chat using APIView
class StandardChatListCreateView(APIView):
    # GET: List all chats for the authenticated user, workbook, and data table
    def get(self, request, workbook_id, table_id): 
        workbook = get_object_or_404(Workbook, id=workbook_id, user=request.user)
        data_table_meta = get_object_or_404(DataTableMeta, workbook=workbook, id=table_id)
        chats = StandardChat.objects.filter(user=request.user, workbook=workbook, dataTable=data_table_meta)

        serializer = StandardChatSerializer(chats, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # POST: Create a new chat for a specific workbook and data table
    def post(self, request, workbook_id, table_id):
        workbook = get_object_or_404(Workbook, id=workbook_id, user=request.user)
        data_table_meta = get_object_or_404(DataTableMeta, workbook=workbook, id=table_id)
        
        serializer = StandardChatCreateSerializer(data=request.data, context={
            'request': request,
            'workbook': workbook,
            'dataTable': data_table_meta
        })
        
        if serializer.is_valid():
            chat = serializer.save()
            return Response(StandardChatSerializer(chat).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Send a message to a chat using APIView
class SendMessageToChatView(APIView):
    # POST: Send a message to the specified chat
    def post(self, request, chat_id):
        print(chat_id, request.data)
        try:
            chat = StandardChat.objects.get(id=chat_id, user=request.user)
        except Exception as e:
            return Response({'error': 'Chat not found'}, status=status.HTTP_404_NOT_FOUND)

        # Deserialize and validate the message payload
        serializer = StandardChatMessageCreateSerializer(
            data=request.data,
            context={'request': request, 'chat': chat}
        )

        print(serializer)

        if serializer.is_valid():
            serializer.save()
            
            # Send the message to the AI chat agent
            agent = OpenAIStandardAgent(chat_id=chat_id, thread_id=chat.threadId)
            response = agent.send_message()
            print('agent response', response)
            
            if response.get('success'):
                # Save the message to the database
                _new_model_message = StandardChatMessage(
                    chat=chat,
                    text=response.get('message'),
                    user=request.user,
                    userType='model'
                )
                _new_model_message.save()

                return Response(response, status=status.HTTP_201_CREATED)
            else:
                return Response(response, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
