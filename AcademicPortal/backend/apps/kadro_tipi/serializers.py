from rest_framework import serializers
from .models import KadroTipi

class KadroTipiSerializer(serializers.ModelSerializer):
    class Meta:
        model = KadroTipi
        fields = ['id', 'tip']
        read_only_fields = ['id']