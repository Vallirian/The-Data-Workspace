from django.contrib.auth.models import AnonymousUser
from rest_framework import authentication, exceptions
import firebase_admin.auth as auth
from django.utils.deprecation import MiddlewareMixin
from django.http import HttpResponse


class FirebaseAuthenticationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        firebase_auth = FirebaseAuthentication()
        try:
            auth_result = firebase_auth.authenticate(request)
            if auth_result:
                request.user, request.auth = auth_result
                return None
        except exceptions.AuthenticationFailed as e:
            return HttpResponse('Unauthorized user.', status=401)

        return HttpResponse('Unauthorized user.', status=401)
    
class Profile(AnonymousUser):
    def __init__(self, uid, _id=None, tenant_id=None, role=None) -> None:
        super().__init__()
        self.uid = uid
        self.tenant_id = tenant_id

    @property
    def is_authenticated(self):
        return True

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
            uid = decoded_token["uid"]
        except:
            raise exceptions.AuthenticationFailed('Token verification failed')

        try:
            profile_data = {}
            if not profile_data:
                raise exceptions.AuthenticationFailed('User not found')

            profile = Profile(
                uid=uid,
                _id=profile_data['_id'],
                tenant_id=profile_data['tenantId'],
                role=profile_data['role']
            )
        except Exception as e:
            raise exceptions.AuthenticationFailed(f'Error fetching user profile: {e}')

        return (profile, token)