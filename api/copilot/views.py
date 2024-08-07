import os
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from helpers import arc_vars as avars, arc_utils as autils, arc_sql as asql, arc_statements as astmts

import google.generativeai as genai
from copilot import send_message as gemini_chat

class CopilotAnalysisChat(APIView):
    def get(self, request):
        chat_id = request.query_params.get("chatId")
        tenant_id = request.user.tenant.id

        if chat_id:
            # details of a specific conversation
            try:
                messages = asql.execute_raw_query(
                    tenant=tenant_id, 
                    queries=[(f"SELECT * FROM `{avars.COPILOT_MESSAGE_TABLE_NAME}` WHERE `chatId` = %s  ORDER BY `createdAt` ASC;", [chat_id])]
                )
                if not messages:
                    return Response({"message": "No messages found"}, status=status.HTTP_404_NOT_FOUND)
                return Response(messages, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({'error': 'Unable to load chat'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            # list of all conversations
            try:
                chat = asql.execute_raw_query(
                    tenant=tenant_id, 
                    queries=[(f"SELECT * FROM `{avars.COPILOT_CHAT_TABLE_NAME}` ORDER BY `createdAt` DESC;", [])]
                )
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
        table_name = request.query_params.get("tableName")
        process_name = request.query_params.get("processName")
        chat_type = request.query_params.get("chatType")

        if not chat_type or chat_type not in avars.COPILOT_CHAT_TYPES:
            return Response({"message": "Please provide a valid scope"}, status=status.HTTP_400_BAD_REQUEST)

        if not message:
            return Response(
                {"message": "Please provide a message"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # create a new conversation
            new_caht_id = autils.custom_uuid()
            new_chat_response_data = asql.execute_raw_query(
                tenant=tenant_id, 
                queries=astmts.get_create_new_chat_query(chat_id=new_caht_id, display_name=message, user_id=request.user.id)
            )
            # record the user's message
            new_message_response_data = asql.execute_raw_query(
                tenant=tenant_id, 
                queries=astmts.get_create_new_message_query(message=message, chat_id=new_caht_id, user_type=avars.COPILOT_USER_USER_TYPE, user_id=request.user.id)
            )
        except Exception as e:
            return Response({'error': 'Failed to start new chat'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            # ask the model for a response
            model_response_text = gemini_chat.send(
                history=[], message=message, tenant_id=tenant_id, chat_type=chat_type, 
                table_name=table_name, process_name=process_name
            )

            # save model's response
            new_model_meessage_response_data = asql.execute_raw_query(
                tenant=tenant_id, 
                queries=astmts.get_create_new_message_query(message=model_response_text, chat_id=new_caht_id, user_type=avars.COPILOT_MODEL_USER_TYPE, user_id=avars.COPILOT_MODEL_USER_NAME)
            )
            
            resonse_message = {
                'id': autils.custom_uuid(), # create palceholder id, the correct id will be grabbed from the database in the next message
                'createdAt': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "message": model_response_text,
                "chatId": new_caht_id,
                "userType": avars.COPILOT_MODEL_USER_TYPE,
                "userId": avars.COPILOT_MODEL_USER_NAME
            }

            return Response(resonse_message, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': 'Failed to start a new chat'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def put(self, request):
        '''
        continues an existing conversation
        '''
        tenant_id = request.user.tenant.id
        chat_id = request.query_params.get("chatId")
        table_name = request.query_params.get("tableName")
        user_message = request.data.get("message") 
        process_name = request.query_params.get("processName")
        chat_type = request.query_params.get("chatType")


        if not user_message:
            return Response({"message": "Please provide a message"},status=status.HTTP_400_BAD_REQUEST)
        if not chat_id:
            return Response({"message": "Please provide a conversationId"},status=status.HTTP_400_BAD_REQUEST)
        
        if not chat_type or chat_type not in avars.COPILOT_CHAT_TYPES:
            return Response({"message": "Please provide a chat type"}, status=status.HTTP_400_BAD_REQUEST)
        
        # record the user's message
        try:
            new_message_response_data = asql.execute_raw_query(
                tenant=tenant_id, 
                queries=astmts.get_create_new_message_query(message=user_message, chat_id=chat_id, user_type=avars.COPILOT_USER_USER_TYPE, user_id=request.user.id)
            )
        except Exception as e:
            return Response({'error': 'Failed to process user message'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        try:

            historical_messages = asql.execute_raw_query(
                tenant=tenant_id, 
                queries=[(f"SELECT * FROM `{avars.COPILOT_MESSAGE_TABLE_NAME}` WHERE `chatId` = %s ORDER BY `createdAt` ASC;", [chat_id])]
            )
            history = []
            for hstr_msg in historical_messages:
                history.append({
                    "parts": [{"text": hstr_msg['message']}],
                    "role": "model" if hstr_msg['userType'] == avars.COPILOT_MODEL_USER_TYPE else avars.COPILOT_USER_USER_TYPE
                })

            # ask the model for a response
            model_response_text = gemini_chat.send(
                history=history, message=user_message, tenant_id=tenant_id, chat_type=chat_type, 
                table_name=table_name, process_name=process_name
            )
            
            # save model's response
            new_model_meessage_response_data = asql.execute_raw_query(
                tenant=tenant_id, 
                queries=astmts.get_create_new_message_query(message=model_response_text, chat_id=chat_id, user_type=avars.COPILOT_MODEL_USER_TYPE, user_id=avars.COPILOT_MODEL_USER_NAME)
            )

            resonse_message = {
                'id': autils.custom_uuid(), # create palceholder id, the correct id will be grabbed from the database in the next message
                'createdAt': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "message": model_response_text,
                "chatId": chat_id,
                "userType": avars.COPILOT_MODEL_USER_TYPE,
                "userId": avars.COPILOT_MODEL_USER_NAME
            }
            return Response(resonse_message, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': 'Failed to process user message'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
