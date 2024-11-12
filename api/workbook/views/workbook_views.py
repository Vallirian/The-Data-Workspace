from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from workbook.models import Workbook, Formula
from workbook.serializers.workbook_serializers import WorkbookSerializer
from django.shortcuts import get_object_or_404
from services.db import DataSegregation, RawData
from django.contrib.auth import get_user_model

arcUser = get_user_model()

class WorkbookListAPIView(APIView):
    def get(self, request):
        workbooks = Workbook.objects.filter(user=request.user).order_by('-createdAt')
        serializer = WorkbookSerializer(workbooks, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = WorkbookSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class WorkbookDetailAPIView(APIView):
    def get(self, request, workbook_id):
        workbook = get_object_or_404(Workbook, id=workbook_id, user=request.user)
        serializer = WorkbookSerializer(workbook)
        return Response(serializer.data)
    
    def delete(self, request, workbook_id, *args, **kwargs):
        # backup consumed input and output tokens for this workbook
        formulas = Formula.objects.filter(workbook_id=workbook_id)

        input_token, output_token = 0, 0
        for formula in formulas:
            data_segregation = DataSegregation(request=request)
            get_token_status, (_result_input_token, _result_output_token), message = data_segregation.get_token_utilization(formula_id=formula.id)  
            print('get_token_status', get_token_status , 'input_token', _result_input_token, 'output_token', _result_output_token, 'message', message)
            if not get_token_status:
                return Response({'message': message}, status=status.HTTP_400_BAD_REQUEST)
            input_token += _result_input_token
            output_token += _result_output_token

        arc_user = arcUser.objects.get(id=request.user.id)
        arc_user.inputTokensConsumedChatDeleted += input_token
        arc_user.outputTokensConsumedChatDeleted += output_token
        arc_user.save()

        # delete raw data
        workbook = get_object_or_404(Workbook, id=workbook_id, user=request.user)
        dataTableMeta = workbook.dataTable
        _raw_data_ops = RawData(request=request, table_id=dataTableMeta.id)
        _raw_data_delete_status, _raw_data_delete_message = _raw_data_ops.delete_table()
        if not _raw_data_delete_status:
            return Response({'message': _raw_data_delete_message}, status=status.HTTP_400_BAD_REQUEST)
        
        # delete workbook: deletes by connection data table meta | data table column meta | delete formula | delete formula messages | delete report
        try:
            workbook.delete()
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message': 'Workbook deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

