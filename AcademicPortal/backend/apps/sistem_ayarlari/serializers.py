from rest_framework import serializers
from .models import SistemAyarlari

class SistemAyarlariSerializer(serializers.ModelSerializer):
    class Meta:
        model = SistemAyarlari
        fields = ['id', 'anahtar', 'deger', 'aciklama']
        read_only_fields = ['id']