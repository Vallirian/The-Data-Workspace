from django.http import JsonResponse
from firebase_admin import auth
from django.utils.deprecation import MiddlewareMixin
from django.urls import resolve

from django.contrib.auth import get_user_model
arcUser = get_user_model()


class FirebaseTokenAuthMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Expect the token to be sent in the Authorization header (Bearer <token>)
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                # Verify the token using Firebase Admin SDK
                decoded_token = auth.verify_id_token(token)
                firebase_uid = decoded_token['uid']  # Get the Firebase UID from the token
                email = decoded_token.get('email', '')

                user, created = arcUser.objects.get_or_create(
                    firebase_uid=firebase_uid,
                    defaults={
                        'email': email,
                    }
                )
                
                # Attach the Django User to request.user
                request.user = user

                if resolve(request.path_info).route.startswith('api/'): 
                    # If the request is for the API, mark it as CSRF exempt 
                    # because we are using Google Firebase for authentication which is stateless
                    request.csrf_processing_done = True

                return None  # Continue processing the request

            except Exception as e:
                print(f'Error processing the authentication token: {e}')
                return JsonResponse({'error': 'Invalid or expired token'}, status=401)
        
        # If no token provided, deny access
        return JsonResponse({'error': 'Authorization token required'}, status=401)
