from django.db import models

class SistemAyarlari(models.Model):
    anahtar = models.CharField(max_length=100, unique=True, verbose_name="Ayar Anahtarı")
    deger = models.TextField(verbose_name="Ayar Değeri")
    aciklama = models.TextField(blank=True, null=True, verbose_name="Açıklama")

    class Meta:
        verbose_name = 'Sistem Ayarı'
        verbose_name_plural = 'Sistem Ayarları'

    def __str__(self):
        return self.anahtar
