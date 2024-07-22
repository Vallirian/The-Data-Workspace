from django.db import transaction
from rest_framework import serializers
from table.models import Table
from column.models import Column
from relationship.models import Relationship

class RelationshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Relationship
        fields = ["id","rightTableColumn", "rightTable", "leftTable"]
        extra_kwargs = {
            "id": {"read_only": True},
            "rightTable": {"read_only": True},
            "leftTable": {"read_only": True},
            "rightTableColumn": {"required": True},
        }
    
    def create(self, validated_data):
        with transaction.atomic():
            # create relationship type
            tenant = self.context['request'].user.tenant
            left_table = Table.objects.get(id=self.context['left_table_id'])
            right_table_column = validated_data['rightTableColumn']
            right_table = right_table_column.table
            
            instance = self.Meta.model(**validated_data, tenant=tenant, leftTable=left_table, rightTable=right_table)
            instance.save()
            return instance