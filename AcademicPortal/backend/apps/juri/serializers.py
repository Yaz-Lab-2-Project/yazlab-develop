from rest_framework import serializers
from .models import JuriAtama, JuriDegerlendirme
from apps.ilanlar.serializers import IlanSerializer
from apps.basvuru.serializers import BasvuruSerializer
from apps.users.serializers import UserSerializer
from apps.basvuru.models import Basvuru

class JuriAtamaSerializer(serializers.ModelSerializer):
    ilan = IlanSerializer(read_only=True)
    juri_uyesi = UserSerializer(read_only=True)
    ilan_id = serializers.IntegerField(write_only=True)
    juri_uyesi_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = JuriAtama
        fields = ['id', 'ilan', 'juri_uyesi', 'atama_tarihi', 'aktif', 'ilan_id', 'juri_uyesi_id']
        read_only_fields = ['atama_tarihi']

class JuriDegerlendirmeSerializer(serializers.ModelSerializer):
    juri_atama = JuriAtamaSerializer(read_only=True)
    basvuru = BasvuruSerializer(read_only=True)
    juri_atama_id = serializers.IntegerField(write_only=True)
    basvuru_id = serializers.IntegerField(write_only=True)
    sonuc = serializers.ChoiceField(choices=JuriDegerlendirme.SONUC_CHOICES)

    class Meta:
        model = JuriDegerlendirme
        fields = ['id', 'juri_atama', 'basvuru', 'sonuc', 'aciklama', 'rapor', 
                 'degerlendirme_tarihi', 'guncelleme_tarihi', 'juri_atama_id', 'basvuru_id']
        read_only_fields = ['degerlendirme_tarihi', 'guncelleme_tarihi']

class JuriAtamaDetaySerializer(serializers.ModelSerializer):
    basvurular = serializers.SerializerMethodField()
    ilan = IlanSerializer(read_only=True)
    juri_uyesi = UserSerializer(read_only=True)

    class Meta:
        model = JuriAtama
        fields = ['id', 'ilan', 'juri_uyesi', 'atama_tarihi', 'aktif', 'basvurular']

    def get_basvurular(self, obj):
        # İlgili ilana yapılmış tüm başvuruları getir
        basvurular = obj.ilan.basvurular.all()
        return BasvuruSerializer(basvurular, many=True).data

class JuriAtamaBasvuruDetaySerializer(serializers.ModelSerializer):
    basvuru = serializers.SerializerMethodField()

    class Meta:
        model = JuriAtama
        fields = ['id', 'ilan', 'juri_uyesi', 'atama_tarihi', 'aktif', 'basvuru']

    def get_basvuru(self, obj):
        basvuru = Basvuru.objects.filter(ilan=obj.ilan, aday=obj.juri_uyesi).first()
        if basvuru:
            return BasvuruSerializer(basvuru).data
        return None