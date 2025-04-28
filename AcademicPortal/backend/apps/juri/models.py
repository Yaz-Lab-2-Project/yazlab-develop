from django.db import models
from django.contrib.auth import get_user_model
from apps.ilanlar.models import Ilan
from apps.basvuru.models import Basvuru

User = get_user_model()

class JuriAtama(models.Model):
    juri_uyesi = models.ForeignKey(User, on_delete=models.CASCADE, related_name='juri_atamalari')
    ilan = models.ForeignKey(Ilan, on_delete=models.CASCADE, related_name='juri_atamalari')
    atama_tarihi = models.DateTimeField(auto_now_add=True)
    aktif = models.BooleanField(default=True)

    class Meta:
        unique_together = ('juri_uyesi', 'ilan')
        verbose_name = 'Jüri Ataması'
        verbose_name_plural = 'Jüri Atamaları'

    def __str__(self):
        return f"{self.juri_uyesi.get_full_name()} - {self.ilan.baslik}"

class JuriDegerlendirme(models.Model):
    SONUC_CHOICES = [
        ('OLUMLU', 'Olumlu'),
        ('OLUMSUZ', 'Olumsuz'),
    ]

    juri_atama = models.ForeignKey(JuriAtama, on_delete=models.CASCADE, related_name='degerlendirmeler')
    basvuru = models.ForeignKey(Basvuru, on_delete=models.CASCADE, related_name='juri_degerlendirmeleri')
    sonuc = models.CharField(max_length=20, choices=SONUC_CHOICES)
    aciklama = models.TextField(blank=True, null=True)
    rapor = models.FileField(upload_to='juri_raporlari/%Y/%m/%d/', null=True, blank=True)
    degerlendirme_tarihi = models.DateTimeField(auto_now_add=True)
    guncelleme_tarihi = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('juri_atama', 'basvuru')
        verbose_name = 'Jüri Değerlendirmesi'
        verbose_name_plural = 'Jüri Değerlendirmeleri'

    def __str__(self):
        return f"{self.juri_atama.juri_uyesi.get_full_name()} - {self.basvuru.aday.get_full_name()}"
