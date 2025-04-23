from rest_framework import serializers
from .models import BelgeSablonu

class BelgeSablonuSerializer(serializers.ModelSerializer):
    class Meta:
        model = BelgeSablonu
        fields = [
            'id', 'tur', 'baslik', 'icerik', 'aktif',
            'olusturulma_tarihi', 'guncelleme_tarihi'
        ]
        read_only_fields = ['id', 'olusturulma_tarihi', 'guncelleme_tarihi']