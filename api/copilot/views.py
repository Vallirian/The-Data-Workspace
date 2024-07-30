import os
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from helpers import arc_vars as avars, arc_utils as autils, arc_sql as asql, arc_statements as astmts

import google.generativeai as genai
import copilot.gemini_helpers as gh

class CopilotAnalysisChat(APIView):
    genai.configure(api_key=os.environ.get("GOOGLE_AI_API_KEY"))
    model = genai.GenerativeModel(os.environ.get("GEMINI_AI_MODEL"))

    def get(self, request):
        conversation_id = request.query_params.get("conversationId")
        tenant_id = request.user.tenant.id

        if conversation_id:
            # details of a specific conversation
            try:
                conversation = CopilotConversation.objects.get(id=conversation_id, tenant_id=tenant_id)
                messages = CopilotMessage.objects.filter(copilotconversation=conversation).order_by("createdAt")
                response = []
                for message in messages:
                    response.append({
                        "message": message.message,
                        "sender": message.sender,
                        "createdAt": message.createdAt
                    })
                return Response(response, status=status.HTTP_200_OK)
            except CopilotConversation.DoesNotExist:
                return Response({"message": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)
        else:
            # list of all conversations
            try:
                conversations = CopilotConversation.objects.filter(tenant_id=tenant_id).order_by("createdAt")
                response = []
                for conversation in conversations:
                    response.append({
                        "conversationId": conversation.id,
                        "displayName": conversation.displayName,
                        "createdAt": conversation.createdAt,
                    })
                return Response(response, status=status.HTTP_200_OK)
            except Exception as e:
                return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        '''
        starts a new conversation
        '''
        tenant_id = request.user.tenant.id
        message = request.data.get("message")
        if not message:
            return Response(
                {"message": "Please provide a message"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # create a new conversation
        try:
            new_conversation_id = autils.custom_uuid()
            asql.execute_raw_query(tenant=tenant_id, query=astmts.get_create_chat_table_query(new_conversation_id))
            new_conversation.save()

            new_user_message = CopilotMessage(copilotconversation=new_conversation, message=message, sender=request.user.id, tenant_id=tenant_id)
            new_user_message.save()
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            genai_response = self.model.generate_content(message)
            response_text = genai_response.text
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # record the response
        try:
            new_model_message = CopilotMessage(copilotconversation=new_conversation, message=response_text, sender=avars.copilot_system_user, tenant_id=tenant_id)
            new_model_message.save()
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'message': response_text, "conversationId": new_conversation.id}, status=status.HTTP_200_OK)

    def put(self, request):
        '''
        continues an existing conversation
        '''
        tenant_id = request.user.tenant.id
        conversation_id = request.query_params.get("conversationId")
        user_message = request.data.get("message")
        if not user_message:
            return Response(
                {"message": "Please provide a message"},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not conversation_id:
            return Response(
                {"message": "Please provide a conversationId"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # record the user's message
        try:
            conversation = CopilotConversation.objects.get(id=conversation_id, tenant_id=tenant_id)
            new_message = CopilotMessage(copilotconversation=conversation, message=user_message, sender=request.user.id, tenant_id=tenant_id)
            new_message.save()
        except Exception as e:
            return Response(str(e), status=status.HTTP_404_NOT_FOUND)
        
        try:
            messages = CopilotMessage.objects.filter(copilotconversation=conversation).order_by("createdAt")
            history = []
            for historical_message in messages:
                history.append({
                    "parts": [{"text": historical_message.message}],
                    "role": "model" if historical_message.sender == avars.copilot_system_user else "user",
                })

            chat = self.model.start_chat(history=history)
            response_text = chat.send_message(user_message).text

            new_message = CopilotMessage(copilotconversation=conversation, message=response_text, sender=avars.copilot_system_user, tenant_id=tenant_id)
            new_message.save()

            return Response({'message': response_text}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(str(e), status=status.HTTP_404_NOT_FOUND)
        