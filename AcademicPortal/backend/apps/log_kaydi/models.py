from django.db import models
from apps.users.models import User

class LogKaydi(models.Model):
    ISLEM_TURU_CHOICES = (
        ('GIRIS', 'Giriş'),
        ('CIKIS', 'Çıkış'),
        ('EKLEME', 'Ekleme'),
        ('GUNCELLEME', 'Güncelleme'),
        ('SILME', 'Silme'),
        ('BILDIRIM', 'Bildirim'),
        ('DIGER', 'Diğer'),
    )
    kullanici = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="log_kayitlari")
    islem_turu = models.CharField(max_length=15, choices=ISLEM_TURU_CHOICES, verbose_name="İşlem Türü")
    islem_detayi = models.TextField(verbose_name="İşlem Detayı")
    islem_tarihi = models.DateTimeField(auto_now_add=True)
    ip_adresi = models.GenericIPAddressField(verbose_name="IP Adresi", blank=True, null=True)

    class Meta:
        verbose_name = 'Log Kaydı'
        verbose_name_plural = 'Log Kayıtları'
        ordering = ['-islem_tarihi']

    def __str__(self):
        return f"{self.kullanici} - {self.get_islem_turu_display()} - {self.islem_tarihi}"
