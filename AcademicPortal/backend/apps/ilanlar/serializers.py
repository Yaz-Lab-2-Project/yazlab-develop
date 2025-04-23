from rest_framework import serializers
from .models import Ilan

class IlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ilan
        fields = [
            'id', 'baslik', 'aciklama', 'birim', 'bolum', 'anabilim_dali',
            'kadro_tipi', 'baslangic_tarihi', 'bitis_tarihi',
            'olusturulma_tarihi', 'olusturan', 'aktif'
        ]
        read_only_fields = ['id', 'olusturulma_tarihi']