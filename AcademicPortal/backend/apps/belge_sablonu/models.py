from django.db import models

class BelgeSablonu(models.Model):
    SABLON_TURU_CHOICES = (
        ('TABLO5', 'Tablo 5 Şablonu'),
        ('JURI_RAPORU', 'Jüri Rapor Şablonu'),
        ('KARAR_RAPORU', 'Karar Rapor Şablonu'),
        ('BASVURU_FORMU', 'Başvuru Formu'),
    )
    tur = models.CharField(max_length=15, choices=SABLON_TURU_CHOICES, verbose_name="Şablon Türü")
    baslik = models.CharField(max_length=255, verbose_name="Şablon Başlığı")
    icerik = models.TextField(verbose_name="Şablon İçeriği")
    aktif = models.BooleanField(default=True, verbose_name="Aktif mi?")
    olusturulma_tarihi = models.DateTimeField(auto_now_add=True)
    guncelleme_tarihi = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Belge Şablonu'
        verbose_name_plural = 'Belge Şablonları'

    def __str__(self):
        return f"{self.baslik} ({self.get_tur_display()})"
