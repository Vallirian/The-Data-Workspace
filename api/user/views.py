import os
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from services.db import DataSegregation
arcUser = get_user_model()

def account(request):
    if request.method == 'GET':
        _data_segregation = DataSegregation(request=request)

        # token utilization
        input_token_limit = int(os.getenv('TIER_FREE_INPUT_TOKEN_LIMIT', 1_000_000))
        output_token_limit = int(os.getenv('TIER_FREE_OUTPUT_TOKEN_LIMIT', 500_000))
        _token_util_statut, (input_token_utilization, output_token_utilization), _token_uitl_message = _data_segregation.get_token_utilization(add_from_backed_up_in_user_model=True)
        print(input_token_utilization, output_token_utilization)

        # data utilization
        raw_data_limit = int(os.getenv('TIER_FREE_DATA_LIMIT_MB', 50))
        _data_util_status, data_utilization = _data_segregation.get_schema_data_size_mb()
        
        
        return JsonResponse({
            'inputTokenLimit': input_token_limit,
            'outputTokenLimit': output_token_limit,
            'inputTokenUtilization': input_token_utilization,
            'outputTokenUtilization': output_token_utilization,
            'tokenLimitExceeded': False if input_token_utilization < input_token_limit and output_token_utilization < output_token_limit else True,
            'dataLimitMB': raw_data_limit,
            'dataUtilizationMB': data_utilization
        }, status=200)
    
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)