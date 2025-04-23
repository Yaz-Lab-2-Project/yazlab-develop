from rest_framework import serializers
from .models import Bolum

class BolumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bolum
        fields = ['id', 'ad', 'birim']
        read_only_fields = ['id']