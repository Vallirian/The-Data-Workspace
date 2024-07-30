from django.db import transaction
from rest_framework import serializers
from user.models import CustomUser
from user.models import Tenant
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from helpers import arc_sql as asql

# JWT toekn customization
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['username'] = user.username
        # ...
        return token
    
# class RegisterCustomUserSerializer(serializers.ModelSerializer):
#     tenantDisplayName = serializers.CharField(write_only=True)  # Explicitly declare the field
#     class Meta:
#         model = CustomUser
#         fields = ["email", "username", "password", "tenantDisplayName"]
#         extra_kwargs = {"password": {"write_only": True}}
    
#     def create(self, validated_data):
#         with transaction.atomic():
#             # create a new tenant
#             tenant_display_name = validated_data.pop('tenantDisplayName', None)
#             tenant = Tenant.objects.create(displayName=tenant_display_name)
#             tenant.save()

#             # create schema for tenant
#             asql.create_schema(tenant.id)

#             # create a new user
#             password = validated_data.pop("password", None)
#             instance = self.Meta.model(**validated_data, tenant=tenant)
#             if password is not None:
#                 instance.set_password(password)
            
#             instance.save()
#             return instance