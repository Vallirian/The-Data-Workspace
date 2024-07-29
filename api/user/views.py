from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.db.utils import OperationalError


from user.models import CustomUser
from user.serializers import RegisterCustomUserSerializer

class RegisterCustomUserView(APIView):
    # create a new account for a new tenant
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterCustomUserSerializer(data=request.data)

        try:
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        except OperationalError as e:
            return Response({'error': f'Database error: operation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f'Unexpected error: failed to create user'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
