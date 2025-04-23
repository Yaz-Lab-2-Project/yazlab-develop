from django.db import models
from apps.birim.models import Birim
from apps.bolum.models import Bolum
from apps.anabilim_dali.models import AnabilimDali
from apps.kadro_tipi.models import KadroTipi

class Ilan(models.Model):
    baslik = models.CharField(max_length=255, verbose_name="İlan Başlığı")
    aciklama = models.TextField(verbose_name="İlan Açıklaması")
    birim = models.ForeignKey(Birim, on_delete=models.CASCADE, related_name="ilanlar")
    bolum = models.ForeignKey(Bolum, on_delete=models.CASCADE, related_name="ilanlar")
    anabilim_dali = models.ForeignKey(AnabilimDali, on_delete=models.CASCADE, related_name="ilanlar")
    kadro_tipi = models.ForeignKey(KadroTipi, on_delete=models.CASCADE, related_name="ilanlar")
    baslangic_tarihi = models.DateTimeField(verbose_name="Başlangıç Tarihi")
    bitis_tarihi = models.DateTimeField(verbose_name="Bitiş Tarihi")
    olusturulma_tarihi = models.DateTimeField(auto_now_add=True)
    olusturan = models.ForeignKey(
        'users.User', 
        on_delete=models.CASCADE, 
        related_name="olusturulan_ilanlar"
    )
    aktif = models.BooleanField(default=True, verbose_name="Aktif mi?")

    class Meta:
        verbose_name = 'İlan'
        verbose_name_plural = 'İlanlar'

    def __str__(self):
        return self.baslik
