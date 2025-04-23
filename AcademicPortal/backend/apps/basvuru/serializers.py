from rest_framework import serializers
from .models import Basvuru, AdayFaaliyet, BasvuruSonuc, Tablo5

class BasvuruSerializer(serializers.ModelSerializer):
    class Meta:
        model = Basvuru
        fields = '__all__'
        read_only_fields = ['id', 'basvuru_tarihi', 'guncelleme_tarihi']

class AdayFaaliyetSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdayFaaliyet
        fields = '__all__'
        read_only_fields = ['id', 'kisi_puani', 'olusturulma_tarihi']

class BasvuruSonucSerializer(serializers.ModelSerializer):
    class Meta:
        model = BasvuruSonuc
        fields = '__all__'
        read_only_fields = ['id', 'karar_tarihi']

class Tablo5Serializer(serializers.ModelSerializer):
    class Meta:
        model = Tablo5
        fields = '__all__'
        read_only_fields = ['id', 'olusturulma_tarihi', 'guncelleme_tarihi']