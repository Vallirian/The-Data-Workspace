from django.db import transaction
from rest_framework import serializers

from column.models import Column
from rawdata.raw_data_helpers import insert_new_column
from table.models import Table

class ColumnSerializer(serializers.ModelSerializer):
    class Meta:
        model = Column
        fields = ["id", "displayName", "description", "dataType", "table"]
        extra_kwargs = {
            "displayName": {"required": True}, 
            "id": {"read_only": True},
            "table": {"read_only": True},
            "description": {"required": True},
            "dataType": {"required": True},
        }
    
    def create(self, validated_data):
        with transaction.atomic():
            # create table type
            tenant = self.context['request'].user.tenant
            table = Table.objects.get(id=self.context['table_id'])
            instance = self.Meta.model(**validated_data, tenant=tenant, table=table)
            instance.save()

            # update raw table
            table = insert_new_column(table_id=table.id, column_id=instance.id, data_type=instance.dataType)
            return instance