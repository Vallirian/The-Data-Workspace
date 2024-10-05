from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Formula
from .serializers import FormulaSerializer, FormulaValidateSerializer
from workbook.models import Workbook
from chat.models import AnalysisChatMessage
from django.shortcuts import get_object_or_404

class FormulaListView(APIView):
    def get(self, request, workbook_id):
        workbok = get_object_or_404(Workbook, id=workbook_id, user=request.user)
        formulas = Formula.objects.filter(isActive=True, workbook=workbok).order_by('-createdAt')
        serializer = FormulaSerializer(formulas, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request, workbook_id):
        if request.data is None:
            return Response({'error': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)
        if 'messageId' not in request.data:
            return Response({'error': 'Message ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # get message
        messageId = request.data['messageId']
        analysisMessage = get_object_or_404(AnalysisChatMessage, id=messageId)
        if (analysisMessage.messageType != 'pql') or (analysisMessage.pql is None):
            return Response({'error': 'This message can not be saved as formula'}, status=status.HTTP_400_BAD_REQUEST)
        
        # check if formula already exists
        formula = Formula.objects.filter(analysisMessage=analysisMessage)
        if formula.exists():
            return Response({'error': 'This formula already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        # create new formula      
        try: 
            workbook = get_object_or_404(Workbook, id=workbook_id, user=request.user)
            formula = Formula.objects.create(
                workbook=workbook,
                analysisMessage=analysisMessage,
                name=analysisMessage.pql.get('NAME', 'No name'),
                description=analysisMessage.pql.get('DESCRIPTION', 'No description'),
                pql=analysisMessage.pql,
            )
            formula.save()
            return Response({'message': 'Formula created successfully'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': 'Error creating formula'}, status=status.HTTP_400_BAD_REQUEST)

class FormulaDetailView(APIView):
    def get(self, request, formula_id):
        # GET Detail (Retrieve a single formula by ID)  
        try:
            formula = Formula.objects.get(id=formula_id, isActive=True)
        except Formula.DoesNotExist:
            return Response({'error': 'Formula not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = FormulaSerializer(formula)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, formula_id):
        try:
            formula = Formula.objects.get(pk=formula_id, isActive=True)
        except Formula.DoesNotExist:
            return Response({'error': 'Formula not found'}, status=status.HTTP_404_NOT_FOUND)

        # Ensure that only 'isValidated' can be updated
        serializer = FormulaValidateSerializer(formula, data=request.data, partial=True)
        
        if 'isValidated' not in request.data:
            return Response({'error': 'Only the "isValidated" field can be updated.'}, status=status.HTTP_400_BAD_REQUEST)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, formula_id):
        # DELETE (Soft delete - set isActive to False)  
        try:
            formula = Formula.objects.get(pk=formula_id)
        except Formula.DoesNotExist:
            return Response({'error': 'Formula not found'}, status=status.HTTP_404_NOT_FOUND)

        formula.isActive = False
        formula.save()
        return Response({'message': 'Formula deactivated successfully'}, status=status.HTTP_204_NO_CONTENT)
