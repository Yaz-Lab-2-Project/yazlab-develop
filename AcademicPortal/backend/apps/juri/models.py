from django.db import models
from apps.ilanlar.models import Ilan
from apps.users.models import User
from apps.basvuru.models import Basvuru

class JuriAtama(models.Model):
    ilan = models.ForeignKey(Ilan, on_delete=models.CASCADE, related_name="juri_atamalari")
    juri_uyesi = models.ForeignKey(User, on_delete=models.CASCADE, related_name="juri_gorevleri")
    atama_tarihi = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Jüri Atama'
        verbose_name_plural = 'Jüri Atamaları'
        unique_together = ('ilan','juri_uyesi')

class JuriDegerlendirme(models.Model):
    DEGERLENDIRME_SONUC_CHOICES = (('OLUMLU','Olumlu'),('OLUMSUZ','Olumsuz'))
    juri_atama = models.ForeignKey(JuriAtama, on_delete=models.CASCADE, related_name="degerlendirmeler")
    basvuru = models.ForeignKey(Basvuru, on_delete=models.CASCADE, related_name="juri_degerlendirmeleri")
    sonuc = models.CharField(max_length=10, choices=DEGERLENDIRME_SONUC_CHOICES, verbose_name="Değerlendirme Sonucu")
    rapor = models.FileField(upload_to='juri_raporlari/', verbose_name="Jüri Raporu")
    degerlendirme_tarihi = models.DateTimeField(auto_now_add=True)
    aciklama = models.TextField(blank=True, null=True, verbose_name="Açıklama")

    class Meta:
        verbose_name = 'Jüri Değerlendirme'
        verbose_name_plural = 'Jüri Değerlendirmeleri'
        unique_together = ('juri_atama','basvuru')
