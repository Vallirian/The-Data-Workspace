from django.contrib.auth import get_user_model
from rest_framework import authentication, exceptions
import firebase_admin.auth as auth
from django.utils.deprecation import MiddlewareMixin
from django.http import HttpResponse

class FirebaseAuthenticationMiddleware(MiddlewareMixin):
    def process_request(self, request):
         # Skip middleware for specific paths
        if request.path.startswith('/api/user/register/'):
            return None  # Do not process authentication for the register endpoint
        
        firebase_auth = FirebaseAuthentication()
        try:
            auth_result = firebase_auth.authenticate(request)
            if auth_result:
                request.user, request.auth = auth_result
                return None
        except exceptions.AuthenticationFailed as e:
            return HttpResponse('Unauthorized user.', status=401)

        return HttpResponse('Unauthorized user.', status=401)

class FirebaseAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        token = request.headers.get('Authorization')
        if not token:
            raise exceptions.AuthenticationFailed('No authentication token provided')

        token_parts = token.split()
        if token_parts[0].lower() != 'bearer' or len(token_parts) != 2:
            raise exceptions.AuthenticationFailed('Invalid authentication token format')

        token = token_parts[1]
        try:
            decoded_token = auth.verify_id_token(token)
            email = decoded_token.get("email", None)
            if not email:
                raise exceptions.AuthenticationFailed('Firebase token missing email')

        except Exception as e:
            raise exceptions.AuthenticationFailed(f'User verification failed')

        # Assuming email is used as the username in Firebase and Django
        User = get_user_model()
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise exceptions.AuthenticationFailed('User does not exist in the database')

        return (user, token)