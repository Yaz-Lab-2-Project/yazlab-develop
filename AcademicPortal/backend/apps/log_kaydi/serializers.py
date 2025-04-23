from rest_framework import serializers
from .models import LogKaydi

class LogKaydiSerializer(serializers.ModelSerializer):
    class Meta:
        model = LogKaydi
        fields = [
            'id', 'kullanici', 'islem_turu', 'islem_detayi',
            'islem_tarihi', 'ip_adresi'
        ]
        read_only_fields = ['id', 'islem_tarihi']