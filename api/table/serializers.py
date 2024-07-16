from django.db import transaction
from rest_framework import serializers

from tenant.models import Tenant
from workspace.models import Workspace
from table.models import TableType

class TableTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TableType
        fields = ["id", "displayName"]
        extra_kwargs = {
            "displayName": {"required": True}, 
            "id": {"read_only": True},
            "description": {"required": False},
        }
    
    def create(self, validated_data):
        with transaction.atomic():
            # get the tenant from user.tenant
            tenant = self.context['request'].user.tenant
            workspace = Workspace.objects.get(pk=self.context['workspace_id'])
            instance = self.Meta.model(**validated_data, tenant=tenant, workspace=workspace)
            instance.save()
            return instance