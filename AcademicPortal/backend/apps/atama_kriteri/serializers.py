from rest_framework import serializers
from .models import AtamaKriteri

class AtamaKriteriSerializer(serializers.ModelSerializer):
    class Meta:
        model = AtamaKriteri
        fields = ['id', 'temel_alan', 'kadro_tipi',
                  'min_makale_sayisi', 'min_baslica_yazar',
                  'min_a1_a2_makale', 'min_a1_a4_makale',
                  'min_a1_a5_makale', 'min_a1_a6_makale',
                  'min_a1_a8_makale', 'min_kisisel_etkinlik',
                  'min_karma_etkinlik', 'min_tez_danismanligi',
                  'min_toplam_puan']
        read_only_fields = ['id']