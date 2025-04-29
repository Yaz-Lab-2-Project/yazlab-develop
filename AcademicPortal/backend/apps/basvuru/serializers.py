from rest_framework import serializers
from .models import Basvuru, AdayFaaliyet, BasvuruSonuc, Tablo5
from apps.users.serializers import UserSerializer
from apps.ilanlar.serializers import IlanSerializer
from apps.ilanlar.models import Ilan

class BasvuruSerializer(serializers.ModelSerializer):
    aday = UserSerializer(read_only=True)
    ilan = IlanSerializer(read_only=True)
    ilan_id = serializers.PrimaryKeyRelatedField(queryset=Ilan.objects.all(), write_only=True, source='ilan')
    ozgecmis_dosyasi = serializers.FileField(required=False)
    diploma_belgeleri = serializers.FileField(required=False)
    yabanci_dil_belgesi = serializers.FileField(required=False)

    class Meta:
        model = Basvuru
        fields = '__all__'
        read_only_fields = ['id', 'basvuru_tarihi', 'guncelleme_tarihi']

    def to_representation(self, instance):
        """Convert the instance to a representation that includes file URLs"""
        ret = super().to_representation(instance)
        request = self.context.get('request')
        
        if request is not None:
            if instance.ozgecmis_dosyasi:
                ret['ozgecmis_dosyasi'] = request.build_absolute_uri(instance.ozgecmis_dosyasi.url)
            if instance.diploma_belgeleri:
                ret['diploma_belgeleri'] = request.build_absolute_uri(instance.diploma_belgeleri.url)
            if instance.yabanci_dil_belgesi:
                ret['yabanci_dil_belgesi'] = request.build_absolute_uri(instance.yabanci_dil_belgesi.url)
        
        return ret

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