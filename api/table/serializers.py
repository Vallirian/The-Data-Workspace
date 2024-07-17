from django.db import transaction
from rest_framework import serializers

from tenant.models import Tenant
from workspace.models import Workspace
from table.models import Table
from table.raw_table_sql_operations import create_raw_table

class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = ["id", "displayName"]
        extra_kwargs = {
            "displayName": {"required": True}, 
            "id": {"read_only": True},
            "description": {"required": False},
        }
    
    def create(self, validated_data):
        with transaction.atomic():
            # create table type
            tenant = self.context['request'].user.tenant
            instance = self.Meta.model(**validated_data, tenant=tenant)
            instance.save()

            # create raw table
            create_raw_table(instance.id)
            return instance