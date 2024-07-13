from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from user.models import CustomUser
from user.serializers import RegisterCustomUserSerializer

class RegisterCustomUserView(APIView):
    # create a new account for a new tenant
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterCustomUserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)