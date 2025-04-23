from django.db import models
from apps.temel_alan.models import TemelAlan
from apps.kadro_tipi.models import KadroTipi

class AtamaKriteri(models.Model):
    temel_alan = models.ForeignKey(TemelAlan, on_delete=models.CASCADE, related_name="atama_kriterleri")
    kadro_tipi = models.ForeignKey(KadroTipi, on_delete=models.CASCADE, related_name="atama_kriterleri")
    min_makale_sayisi = models.IntegerField(verbose_name="Minimum Makale Sayısı")
    min_baslica_yazar = models.IntegerField(verbose_name="Minimum Başlıca Yazar Sayısı")
    min_a1_a2_makale = models.IntegerField(default=0, verbose_name="Min A1-A2 Makale")
    min_a1_a4_makale = models.IntegerField(default=0, verbose_name="Min A1-A4 Makale")
    min_a1_a5_makale = models.IntegerField(default=0, verbose_name="Min A1-A5 Makale")
    min_a1_a6_makale = models.IntegerField(default=0, verbose_name="Min A1-A6 Makale")
    min_a1_a8_makale = models.IntegerField(default=0, verbose_name="Min A1-A8 Makale")
    min_kisisel_etkinlik = models.IntegerField(default=0, verbose_name="Min Kişisel Etkinlik")
    min_karma_etkinlik = models.IntegerField(default=0, verbose_name="Min Karma Etkinlik")
    min_tez_danismanligi = models.IntegerField(default=0, verbose_name="Min Tez Danışmanlığı")
    min_toplam_puan = models.IntegerField(verbose_name="Minimum Toplam Puan")

    class Meta:
        verbose_name = 'Atama Kriteri'
        verbose_name_plural = 'Atama Kriterleri'
        unique_together = ('temel_alan', 'kadro_tipi')

    def __str__(self):
        return f"{self.temel_alan} - {self.kadro_tipi}"
