import os
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from helpers import arc_vars as avars, arc_utils as autils, arc_sql as asql, arc_statements as astmts

import google.generativeai as genai
import copilot.gemini_helpers as gh

class CopilotAnalysisChat(APIView):
    def get(self, request):
        chat_id = request.query_params.get("chatId")
        tenant_id = request.user.tenant.id

        if chat_id:
            # details of a specific conversation
            try:
                messages = asql.execute_raw_query(tenant=tenant_id, query=f"SELECT * FROM `{avars.COPILOT_MESSAGE_TABLE_NAME}` WHERE chatId = {chat_id}  ORDER BY `createdAt` DESC;")
                if not messages:
                    return Response({"message": "No messages found"}, status=status.HTTP_404_NOT_FOUND)
                return Response(messages, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({'error': 'Unable to load chat'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            # list of all conversations
            try:
                chat = asql.execute_raw_query(tenant=tenant_id, query=f"SELECT * FROM `{avars.COPILOT_CHAT_TABLE_NAME}` ORDER BY `createdAt` DESC;")
                if not chat:
                    return Response({"message": "No chat found"}, status=status.HTTP_404_NOT_FOUND)
                return Response(chat, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({'error': 'Unable to load chat'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        '''
        starts a new conversation
        '''
        tenant_id = request.user.tenant.id
        message = request.data.get("message")
        table_name = request.data.get("tableName")
        if not message:
            return Response(
                {"message": "Please provide a message"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # create a new conversation
            new_caht_id = autils.custom_uuid()
            new_chat_response_data = asql.execute_raw_query(tenant=tenant_id, query=astmts.get_create_new_chat_query(chat_id=new_caht_id, display_name=message, user_id=request.user.id))

            # record the user's message
            new_message_response_data = asql.execute_raw_query(tenant=tenant_id, query=astmts.get_create_new_message_query(message=message, chat_id=new_caht_id, user_type=avars.COPILOT_USER_USER_TYPE, user_id=request.user.id))
        except Exception as e:
            return Response({'error': 'Failed to start new chat'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            model_response_text = gh.send_analysis_message(history=[], message=message, tenant_id=tenant_id, table_name=table_name)
            new_model_meessage_response_data = asql.execute_raw_query(tenant=tenant_id, query=astmts.get_create_new_message_query(message=model_response_text, chat_id=new_caht_id, user_type=avars.COPILOT_MODEL_USER_TYPE, user_id=avars.COPILOT_MODEL_USER_NAME))
            return Response({'message': model_response_text}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    # def put(self, request):
    #     '''
    #     continues an existing conversation
    #     '''
    #     tenant_id = request.user.tenant.id
    #     conversation_id = request.query_params.get("conversationId")
    #     user_message = request.data.get("message")
    #     if not user_message:
    #         return Response(
    #             {"message": "Please provide a message"},
    #             status=status.HTTP_400_BAD_REQUEST
    #         )
    #     if not conversation_id:
    #         return Response(
    #             {"message": "Please provide a conversationId"},
    #             status=status.HTTP_400_BAD_REQUEST
    #         )
        
    #     # record the user's message
    #     try:
    #         conversation = CopilotConversation.objects.get(id=conversation_id, tenant_id=tenant_id)
    #         new_message = CopilotMessage(copilotconversation=conversation, message=user_message, sender=request.user.id, tenant_id=tenant_id)
    #         new_message.save()
    #     except Exception as e:
    #         return Response(str(e), status=status.HTTP_404_NOT_FOUND)
        
    #     try:
    #         messages = CopilotMessage.objects.filter(copilotconversation=conversation).order_by("createdAt")
    #         history = []
    #         for historical_message in messages:
    #             history.append({
    #                 "parts": [{"text": historical_message.message}],
    #                 "role": "model" if historical_message.sender == avars.copilot_system_user else "user",
    #             })

    #         chat = self.model.start_chat(history=history)
    #         response_text = chat.send_message(user_message).text

    #         new_message = CopilotMessage(copilotconversation=conversation, message=response_text, sender=avars.copilot_system_user, tenant_id=tenant_id)
    #         new_message.save()

    #         return Response({'message': response_text}, status=status.HTTP_200_OK)
    #     except Exception as e:
    #         return Response(str(e), status=status.HTTP_404_NOT_FOUND)
        