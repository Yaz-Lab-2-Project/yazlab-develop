from rest_framework import serializers
from .models import TemelAlan

class TemelAlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = TemelAlan
        fields = ['id', 'ad']
        read_only_fields = ['id']