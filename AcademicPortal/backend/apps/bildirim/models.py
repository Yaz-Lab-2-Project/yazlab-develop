from django.db import models
from apps.users.models import User

class Bildirim(models.Model):
    BILDIRIM_TURU_CHOICES = (
        ('BASVURU','Başvuru Bildirimi'),
        ('JURI','Jüri Bildirimi'),
        ('DEGERLENDIRME','Değerlendirme Bildirimi'),
        ('SONUC','Sonuç Bildirimi'),
        ('SISTEM','Sistem Bildirimi'),
    )
    alici = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bildirimler")
    baslik = models.CharField(max_length=255, verbose_name="Bildirim Başlığı")
    mesaj = models.TextField(verbose_name="Bildirim Mesajı")
    tur = models.CharField(max_length=15, choices=BILDIRIM_TURU_CHOICES, verbose_name="Bildirim Türü")
    okundu = models.BooleanField(default=False, verbose_name="Okundu mu?")
    olusturulma_tarihi = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Bildirim'
        verbose_name_plural = 'Bildirimler'

    def __str__(self):
        return f"{self.alici} - {self.baslik}"
