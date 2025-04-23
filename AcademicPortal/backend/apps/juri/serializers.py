from rest_framework import serializers
from .models import JuriAtama, JuriDegerlendirme

class JuriAtamaSerializer(serializers.ModelSerializer):
    class Meta:
        model = JuriAtama
        fields = ['id', 'ilan', 'juri_uyesi', 'atama_tarihi']
        read_only_fields = ['id', 'atama_tarihi']

class JuriDegerlendirmeSerializer(serializers.ModelSerializer):
    class Meta:
        model = JuriDegerlendirme
        fields = ['id', 'juri_atama', 'basvuru', 'sonuc', 'rapor', 'degerlendirme_tarihi', 'aciklama']
        read_only_fields = ['id', 'degerlendirme_tarihi']