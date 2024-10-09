from django.http import JsonResponse
from firebase_admin import auth
from django.contrib.auth.models import User

def register_user(request):
    print('register_user')
    if request.method == 'POST':
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

            # Verify the Firebase ID token
            try:
                decoded_token = auth.verify_id_token(token)
                uid = decoded_token['uid']
                email = decoded_token.get('email')
                
                # Register or authenticate user in your Django backend
                user, created = User.objects.get_or_create(username=uid, defaults={'email': email})
                
                if created:
                    return JsonResponse({'message': 'User registered successfully'}, status=201)
                else:
                    return JsonResponse({'message': 'User already exists'}, status=200)
            
            except Exception as e:
                return JsonResponse({'error': str(e)}, status=400)
