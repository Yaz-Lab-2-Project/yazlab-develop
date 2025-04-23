from rest_framework import serializers
from .models import Birim

class BirimSerializer(serializers.ModelSerializer):
    class Meta:
        model = Birim
        fields = ['id', 'ad', 'temel_alan']
        read_only_fields = ['id']