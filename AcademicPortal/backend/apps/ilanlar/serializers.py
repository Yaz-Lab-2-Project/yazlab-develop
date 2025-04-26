# apps/ilanlar/serializers.py
from rest_framework import serializers
from .models import Ilan
# İlişkili isimleri göstermek için StringRelatedField veya diğer serializer'lar import edilebilir
# from django.contrib.auth import get_user_model
# User = get_user_model()

class IlanSerializer(serializers.ModelSerializer):
    # ===> Okuma İşlemleri İçin İlişkili Alan Adları (Önerilen) <====
    # Bu alanlar API yanıtında ID yerine isimlerin görünmesini sağlar
    # source kullanarak doğru model alanlarına işaret edilir
    olusturan_username = serializers.CharField(source='olusturan.username', read_only=True)
    kadro_tipi_ad = serializers.CharField(source='kadro_tipi.tip', read_only=True)
    birim_ad = serializers.CharField(source='birim.ad', read_only=True)
    bolum_ad = serializers.CharField(source='bolum.ad', read_only=True)
    anabilim_dali_ad = serializers.CharField(source='anabilim_dali.ad', read_only=True)

    class Meta:
        model = Ilan
        fields = [
            'id', 'baslik', 'aciklama',
            'birim',        # Yazma işlemi için Birim ID'si
            'bolum',        # Yazma işlemi için Bolum ID'si
            'anabilim_dali',# Yazma işlemi için AnabilimDali ID'si
            'kadro_tipi',   # Yazma işlemi için KadroTipi ID'si
            'baslangic_tarihi', 'bitis_tarihi', 'aktif',
            'olusturulma_tarihi', # ReadOnly
            'olusturan',    # Yazma için ReadOnly olacak, Okuma için ID dönecek
            # Okuma için eklenen alanlar:
            'olusturan_username', 'kadro_tipi_ad', 'birim_ad', 'bolum_ad', 'anabilim_dali_ad',
        ]
        # ====> DÜZELTME: 'olusturan' BURAYA EKLENDİ <====
        # 'olusturan' alanı view (perform_create) tarafından set edileceği için
        # serializer'ın input olarak beklemesine gerek yok.
        read_only_fields = ['id', 'olusturulma_tarihi', 'olusturan']