from django.http import JsonResponse
from firebase_admin import auth
from django.contrib.auth.models import User

def register_user(request):
    if request.method == 'POST':
        token = request.POST.get('token')
        
        # Verify the Firebase ID token
        try:
            print('verifying token')
            decoded_token = auth.verify_id_token(token)
            uid = decoded_token['uid']
            email = decoded_token.get('email')
            print('decoded_token:', decoded_token)
            print('uid:', uid)
            
            # Register or authenticate user in your Django backend
            user, created = User.objects.get_or_create(username=uid, defaults={'email': email})
            
            if created:
                return JsonResponse({'message': 'User registered successfully'}, status=201)
            else:
                return JsonResponse({'message': 'User already exists'}, status=200)
        
        except Exception as e:
            print('error in register user:', e)
            return JsonResponse({'error': str(e)}, status=400)
