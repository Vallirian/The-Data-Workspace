from rest_framework import serializers
from tenant.models import Tenant

class RegisterTenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = ["displayName"]
        
    def create(self, validated_data):
        instance = self.Meta.model(**validated_data)
        instance.save()
        return instance.id