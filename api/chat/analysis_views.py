from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import AnalysisChat
from workbook.models import Workbook
from datatable.models import DataTableMeta
from django.shortcuts import get_object_or_404
from .analysis_serializers import (
    AnalysisChatSerializer,
    AnalysisChatCreateSerializer
)
from services.ai_chat.agents import OpenAIStandardAgent


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