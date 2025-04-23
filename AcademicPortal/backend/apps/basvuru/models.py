from django.db import models
from apps.users.models import User
from apps.ilanlar.models import Ilan
from apps.faaliyet.models import Faaliyet

class Basvuru(models.Model):
    BASVURU_DURUMU_CHOICES = (
        ('BEKLEMEDE','Beklemede'),
        ('INCELEMEDE','İncelemede'),
        ('ONAYLANDI','Onaylandı'),
        ('REDDEDILDI','Reddedildi'),
    )
    aday = models.ForeignKey(User, on_delete=models.CASCADE, related_name="basvurular")
    ilan = models.ForeignKey(Ilan, on_delete=models.CASCADE, related_name="basvurular")
    durum = models.CharField(max_length=15, choices=BASVURU_DURUMU_CHOICES, default='BEKLEMEDE')
    basvuru_tarihi = models.DateTimeField(auto_now_add=True)
    guncelleme_tarihi = models.DateTimeField(auto_now=True)
    ozgecmis_dosyasi = models.FileField(upload_to='ozgecmisler/', verbose_name="Özgeçmiş Dosyası")
    diplama_belgeleri = models.FileField(upload_to='diplomalar/', verbose_name="Diploma Belgeleri")
    yabanci_dil_belgesi = models.FileField(upload_to='yabanci_dil/', verbose_name="Yabancı Dil Belgesi")

    class Meta:
        verbose_name = 'Başvuru'
        verbose_name_plural = 'Başvurular'
        unique_together = ('aday','ilan')

    def __str__(self):
        return f"{self.aday} - {self.ilan} ({self.get_durum_display()})"

class AdayFaaliyet(models.Model):
    basvuru = models.ForeignKey(Basvuru, on_delete=models.CASCADE, related_name="aday_faaliyetler")
    faaliyet = models.ForeignKey(Faaliyet, on_delete=models.CASCADE, related_name="aday_faaliyetler")
    baslik = models.CharField(max_length=255, verbose_name="Faaliyet Başlığı")
    aciklama = models.TextField(verbose_name="Açıklama")
    yazar_sayisi = models.IntegerField(default=1, verbose_name="Yazar Sayısı")
    baslica_yazar_mi = models.BooleanField(default=False, verbose_name="Başlıca Yazar mı?")
    kisi_puani = models.FloatField(blank=True, null=True, verbose_name="Kişi Puanı")
    kanit_belgesi = models.FileField(upload_to='kanitlar/', verbose_name="Kanıt Belgesi")
    olusturulma_tarihi = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Aday Faaliyet'
        verbose_name_plural = 'Aday Faaliyetler'

    def save(self, *args, **kwargs):
        base_puan = self.faaliyet.puan
        # ... (size’a göre k_katsayisi ve hesaplama) ...
        super().save(*args, **kwargs)

class BasvuruSonuc(models.Model):
    basvuru = models.OneToOneField(Basvuru, on_delete=models.CASCADE, related_name="sonuc")
    karar = models.CharField(max_length=15, choices=Basvuru.BASVURU_DURUMU_CHOICES, verbose_name="Karar")
    karar_tarihi = models.DateTimeField(auto_now_add=True)
    karar_veren = models.ForeignKey(User, on_delete=models.CASCADE, related_name="verdigi_kararlar")
    karar_raporu = models.FileField(upload_to='karar_raporlari/', blank=True, null=True, verbose_name="Karar Raporu")
    aciklama = models.TextField(blank=True, null=True, verbose_name="Açıklama")

    class Meta:
        verbose_name = 'Başvuru Sonuç'
        verbose_name_plural = 'Başvuru Sonuçları'

class Tablo5(models.Model):
    basvuru = models.OneToOneField(Basvuru, on_delete=models.CASCADE, related_name="tablo5")
    pdf_dosyasi = models.FileField(upload_to='tablo5/', verbose_name="Tablo 5 PDF Dosyası")
    toplam_puan = models.FloatField(verbose_name="Toplam Puan")
    olusturulma_tarihi = models.DateTimeField(auto_now_add=True)
    guncelleme_tarihi = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Tablo 5'
        verbose_name_plural = 'Tablo 5 Dosyaları'
