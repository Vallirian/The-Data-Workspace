import os
from django.http import JsonResponse
from firebase_admin import auth
from django.utils.deprecation import MiddlewareMixin
from django.urls import resolve
from services.db import DataSegregation
from services.db import DataSegregation
from django.contrib.auth import get_user_model

arcUser = get_user_model()

def get_user_token_utilization(request):
    input_token = 0
    output_token = 0
    status, (input_token, output_token), message = DataSegregation(request=request).get_token_utilization()

    if not status:
        return True, (input_token, output_token), message

    tier = request.user.tier
    if tier == 'free':
        input_token_limit = int(os.getenv('TIER_FREE_INPUT_TOKEN_LIMIT', 1_000_000))
        output_token_limit = int(os.getenv('TIER_FREE_OUTPUT_TOKEN_LIMIT', 500_000))
        if input_token >= input_token_limit or output_token >= output_token_limit:
            return True, (input_token, output_token), "Token limit exceeded"
        else:
            return False, (input_token, output_token), "Token limit not exceeded"
    else:
        return True, (input_token, output_token), "Tier not supported"
    
def get_user_data_utilization(request):
    used_data = 0
    
    tier = request.user.tier
    if tier == 'free':
        status, value = DataSegregation(request=request).get_schema_data_size_mb()
        if not status:
            return True, value, "Error getting data utilization"

        user_raw_data_limit_mb = float(os.getenv('TIER_FREE_DATA_LIMIT_MB', 100))

        if value >= user_raw_data_limit_mb:
            return True, value, "Data limit exceeded"
        else:
            return False, value, "Data limit not exceeded"
    else:
        return True, used_data, "Tier not supported"


class FirebaseTokenAuthMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Expect the token to be sent in the Authorization header (Bearer <token>)
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
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
                    
                    # Attach the Django User to request.user. Needs to happen before
                    # the DataSegregation is called because it uses the request.user
                    request.user = user
                except Exception as e:
                    return JsonResponse({'error': 'Authentication falied, please logout and login again'}, status=401)
                
                data_segregation = DataSegregation(request=request)
                _user_scema_exists = data_segregation.schema_exists()
                if created or (not _user_scema_exists):
                    DataSegregation(request=request).create_user_schema()

                # if newlly created user, create a demo workbook
                try:
                    if created:
                        DataSegregation(request=request).create_demo_workbook()
                except Exception as e:
                    pass
                

                if resolve(request.path_info).route.startswith('api/v2/app/'): 
                    # If the request is for the API, mark it as CSRF exempt 
                    # because we are using Google Firebase for authentication which is stateless
                    request.csrf_processing_done = True

                
                return None  # Continue processing the request

            except Exception as e:
                return JsonResponse({'error': str(e)}, status=401)
        
        # If no token provided, deny access
        return JsonResponse({'error': 'Authentication falied, please logout and login again'}, status=401)
