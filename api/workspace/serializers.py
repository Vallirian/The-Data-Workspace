from django.db import transaction
from rest_framework import serializers
from user.models import CustomUser
from tenant.models import Tenant
from workspace.models import Workspace

class WorkspaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workspace
        fields = ["id", "displayName"]
        extra_kwargs = {
            "displayName": {"required": True}, 
            "id": {"read_only": True},
        }
    
    def create(self, validated_data):
        with transaction.atomic():
            # get the tenant from user.tenant
            tenant = self.context['request'].user.tenant
            instance = self.Meta.model(**validated_data, tenant=tenant)
            instance.save()
            return instance