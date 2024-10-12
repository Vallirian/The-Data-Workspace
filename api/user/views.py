import os
from django.http import JsonResponse
from firebase_admin import auth
from django.contrib.auth import get_user_model
from user.firebase_middleware import get_user_token_utilization, get_user_data_utilization
arcUser = get_user_model()

def account(request):
    if request.method == 'GET':
        # token utilization
        input_token_limit = int(os.getenv('TIER_FREE_INPUT_TOKEN_LIMIT', 1_000_000))
        output_token_limit = int(os.getenv('TIER_FREE_OUTPUT_TOKEN_LIMIT', 500_000))
        token_limit_exceeded, token_utilization, message = get_user_token_utilization(request)

        # data utilization
        raw_data_limit = int(os.getenv('TIER_FREE_DATA_LIMIT_MB', 50))
        data_limit_exceeded, data_utilization, data_message = get_user_data_utilization(request)
        
        
        return JsonResponse({
            'inputTokenLimit': input_token_limit,
            'outputTokenLimit': output_token_limit,
            'inputTokenUtilization': token_utilization[0],
            'outputTokenUtilization': token_utilization[1],
            'tokenLimitExceeded': token_limit_exceeded,
            'dataLimitMB': raw_data_limit,
            'dataUtilizationMB': data_utilization
        }, status=200)
        

    elif request.method == 'POST':
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

            # Verify the Firebase ID token
            try:
                decoded_token = auth.verify_id_token(token)
                firebase_uid = decoded_token['uid']
                email = decoded_token.get('email')

                # Register or authenticate user in your Django backend
                user, created = arcUser.objects.get_or_create(
                    firebase_uid=firebase_uid,
                    defaults={'email': email}
                )

                if created:
                    return JsonResponse({'message': 'User registered successfully'}, status=201)
                else:
                    return JsonResponse({'message': 'User already exists'}, status=200)

            
            except Exception as e:
                return JsonResponse({'error': str(e)}, status=400)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)