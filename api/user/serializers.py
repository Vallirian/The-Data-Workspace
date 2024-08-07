from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# JWT toekn customization
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        return token