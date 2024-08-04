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
            print('authenticating')
            auth_result = firebase_auth.authenticate(request)
            print('auth_result', auth_result)
            if auth_result:
                request.user, request.auth = auth_result
                return None
        except exceptions.AuthenticationFailed as e:
            return HttpResponse('Unauthorized user.', status=401)

        return HttpResponse('Unauthorized user.', status=401)

class FirebaseAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        token = request.headers.get('Authorization')
        print('token', token)
        if not token:
            raise exceptions.AuthenticationFailed('No authentication token provided')

        token_parts = token.split()
        if token_parts[0].lower() != 'bearer' or len(token_parts) != 2:
            raise exceptions.AuthenticationFailed('Invalid authentication token format')
        print('token_parts', token_parts)

        token = token_parts[1]
        try:
            print('verifying token')
            decoded_token = auth.verify_id_token(token)
            print('decoded_token', decoded_token)
            email = decoded_token.get("email", None)
            if not email:
                raise exceptions.AuthenticationFailed('Firebase token missing email')

        except Exception as e:
            print('Token verification failed:', str(e))
            raise exceptions.AuthenticationFailed(f'Token verification failed: {str(e)}')

        # Assuming email is used as the username in Firebase and Django
        User = get_user_model()
        print('User', User)
        print('User.objects', User.objects)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise exceptions.AuthenticationFailed('User does not exist in the database')

        return (user, token)