import os
from django.http import JsonResponse
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
    
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)