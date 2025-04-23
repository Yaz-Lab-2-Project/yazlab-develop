from rest_framework import serializers
from .models import Bildirim

class BildirimSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bildirim
        fields = ['id', 'alici', 'baslik', 'mesaj', 'tur', 'okundu', 'olusturulma_tarihi']
        read_only_fields = ['id', 'olusturulma_tarihi']