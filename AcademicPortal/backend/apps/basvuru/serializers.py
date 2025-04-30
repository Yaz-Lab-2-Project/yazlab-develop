from rest_framework import serializers
from .models import Basvuru, AdayFaaliyet, BasvuruSonuc, Tablo5, DegerlendirmeBelgesi
from apps.users.serializers import UserSerializer
from apps.ilanlar.serializers import IlanSerializer
from apps.ilanlar.models import Ilan
import os
import logging

logger = logging.getLogger(__name__)

class BasvuruSerializer(serializers.ModelSerializer):
    aday = UserSerializer(read_only=True)
    ilan = serializers.PrimaryKeyRelatedField(queryset=Ilan.objects.all())
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

class DegerlendirmeBelgesiSerializer(serializers.ModelSerializer):
    belge_url = serializers.SerializerMethodField()
    yukleyen_adi = serializers.SerializerMethodField()
    basvuru = serializers.PrimaryKeyRelatedField(queryset=Basvuru.objects.all())

    class Meta:
        model = DegerlendirmeBelgesi
        fields = ['id', 'basvuru', 'belge', 'belge_url', 'belge_adi', 'yukleyen', 'yukleyen_adi', 'yukleme_tarihi']
        read_only_fields = ['id', 'yukleyen', 'yukleme_tarihi']

    def get_belge_url(self, obj):
        """Belge dosyasının URL'sini oluşturur"""
        request = self.context.get('request')
        if not request:
            return None
            
        try:
            if obj.belge and hasattr(obj.belge, 'url'):
                return request.build_absolute_uri(obj.belge.url)
        except Exception as e:
            logger.error(f"Belge URL'si oluşturulurken hata: {str(e)}")
        
        return None

    def get_yukleyen_adi(self, obj):
        """Belgeyi yükleyen kullanıcının adını döndürür"""
        try:
            if hasattr(obj, 'yukleyen') and obj.yukleyen:
                if hasattr(obj.yukleyen, 'get_full_name'):
                    return obj.yukleyen.get_full_name()
                return str(obj.yukleyen)
        except Exception as e:
            logger.error(f"Yükleyen adı alınırken hata: {str(e)}")
            
        return "Bilinmeyen Kullanıcı"
    
    def validate_belge(self, value):
        """Belge dosyasını doğrular"""
        if not value:
            raise serializers.ValidationError("Belge dosyası gereklidir.")
        
        # Dosya boyutu kontrolü (örn. 10MB)
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("Dosya boyutu 10MB'ı aşamaz.")
            
        # Dosya uzantısı kontrolü
        ext = os.path.splitext(value.name)[1].lower()
        valid_extensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx']
        
        if ext not in valid_extensions:
            raise serializers.ValidationError(f"Geçersiz dosya formatı. Kabul edilen formatlar: {', '.join(valid_extensions)}")
            
        return value
    
    def validate(self, attrs):
        """Tüm veriyi doğrular"""
        # Basvuru varlığını kontrol et
        if 'basvuru' not in attrs or not attrs['basvuru']:
            raise serializers.ValidationError({"basvuru": "Başvuru ID'si gereklidir."})
            
        return attrs

    def create(self, validated_data):
        """Yeni bir değerlendirme belgesi oluşturur"""
        try:
            # Belge adı belirtilmemişse, dosya adını kullan
            if 'belge_adi' not in validated_data or not validated_data['belge_adi']:
                if 'belge' in validated_data and validated_data['belge']:
                    file_name = os.path.basename(validated_data['belge'].name)
                    # Uzantıyı kaldır
                    base_name, _ = os.path.splitext(file_name)
                    validated_data['belge_adi'] = base_name
            
            # Kullanıcı bilgisini ayarla
            if 'request' in self.context and hasattr(self.context['request'], 'user'):
                validated_data['yukleyen'] = self.context['request'].user
            
            # Nesneyi oluştur
            return super().create(validated_data)
        except Exception as e:
            logger.error(f"Değerlendirme belgesi oluşturulurken hata: {str(e)}")
            raise serializers.ValidationError(f"Belge kaydedilemedi: {str(e)}")
            
    def to_representation(self, instance):
        """Nesneyi JSON temsiline dönüştürür"""
        try:
            representation = super().to_representation(instance)
            
            # Basvuru nesnesini ID'den basvuru bilgilerine genişlet
            if 'basvuru' in representation and isinstance(representation['basvuru'], int):
                try:
                    basvuru = Basvuru.objects.get(id=representation['basvuru'])
                    representation['basvuru_detay'] = {
                        'id': basvuru.id,
                        'aday': {
                            'id': basvuru.aday.id,
                            'ad_soyad': basvuru.aday.get_full_name()
                        } if basvuru.aday else None,
                        'ilan': {
                            'id': basvuru.ilan.id,
                            'baslik': basvuru.ilan.baslik
                        } if basvuru.ilan else None
                    }
                except Basvuru.DoesNotExist:
                    pass
                    
            return representation
        except Exception as e:
            logger.error(f"DegerlendirmeBelgesi temsili oluşturulurken hata: {str(e)}")
            return super().to_representation(instance)