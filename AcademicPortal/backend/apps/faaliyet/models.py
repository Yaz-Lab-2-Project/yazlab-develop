from django.db import models
from apps.temel_alan.models import TemelAlan
from apps.kadro_tipi.models import KadroTipi

class FaaliyetKategorisi(models.Model):
    kod = models.CharField(max_length=5, verbose_name="Kategori Kodu")
    baslik = models.CharField(max_length=255, verbose_name="Kategori Başlığı")
    aciklama = models.TextField(blank=True, null=True, verbose_name="Açıklama")

    class Meta:
        verbose_name = 'Faaliyet Kategorisi'
        verbose_name_plural = 'Faaliyet Kategorileri'

    def __str__(self):
        return f"{self.kod}. {self.baslik}"

class Faaliyet(models.Model):
    kategori = models.ForeignKey(FaaliyetKategorisi, on_delete=models.CASCADE, related_name="faaliyetler")
    kod = models.CharField(max_length=10, verbose_name="Faaliyet Kodu")
    baslik = models.CharField(max_length=255, verbose_name="Faaliyet Başlığı")
    puan = models.IntegerField(verbose_name="Puan Değeri")
    aciklama = models.TextField(blank=True, null=True, verbose_name="Açıklama")

    class Meta:
        verbose_name = 'Faaliyet'
        verbose_name_plural = 'Faaliyetler'
        unique_together = ('kategori', 'kod')

    def __str__(self):
        return f"{self.kod} - {self.baslik}"

# Detay modelleri:
class MakaleDetay(models.Model):
    Q_DILIMI_CHOICES = (('Q1','Q1'),('Q2','Q2'),('Q3','Q3'),('Q4','Q4'),('NONE','Yok'))
    aday_faaliyet = models.OneToOneField('basvuru.AdayFaaliyet', on_delete=models.CASCADE, related_name="makale_detay")
    dergi_adi = models.CharField(max_length=255, verbose_name="Dergi Adı")
    cilt_no = models.CharField(max_length=50, verbose_name="Cilt No")
    sayfa = models.CharField(max_length=50, verbose_name="Sayfa")
    yil = models.IntegerField(verbose_name="Yıl")
    doi = models.CharField(max_length=255, blank=True, null=True, verbose_name="DOI")
    indeks = models.CharField(max_length=50, blank=True, null=True, verbose_name="İndeks")
    q_dilimi = models.CharField(max_length=4, choices=Q_DILIMI_CHOICES, default='NONE', verbose_name="Q Dilimi")
    derleme_mi = models.BooleanField(default=False, verbose_name="Derleme Makalesi mi?")

    class Meta:
        verbose_name = 'Makale Detay'
        verbose_name_plural = 'Makale Detayları'

class KitapDetay(models.Model):
    aday_faaliyet = models.OneToOneField('basvuru.AdayFaaliyet', on_delete=models.CASCADE, related_name="kitap_detay")
    yayinevi = models.CharField(max_length=255, verbose_name="Yayınevi")
    isbn = models.CharField(max_length=20, verbose_name="ISBN")
    basim_yili = models.IntegerField(verbose_name="Basım Yılı")
    uluslararasi_mi = models.BooleanField(default=False, verbose_name="Uluslararası mı?")

    class Meta:
        verbose_name = 'Kitap Detay'
        verbose_name_plural = 'Kitap Detayları'

class AtifDetay(models.Model):
    aday_faaliyet = models.OneToOneField('basvuru.AdayFaaliyet', on_delete=models.CASCADE, related_name="atif_detay")
    atif_yapilan_eser = models.CharField(max_length=255, verbose_name="Atıf Yapılan Eser")
    atif_yapan_eser = models.CharField(max_length=255, verbose_name="Atıf Yapan Eser")
    atif_yili = models.IntegerField(verbose_name="Atıf Yılı")
    atif_indeksi = models.CharField(max_length=50, blank=True, null=True, verbose_name="Atıf İndeksi")

    class Meta:
        verbose_name = 'Atıf Detay'
        verbose_name_plural = 'Atıf Detayları'

class TezDanismanligiDetay(models.Model):
    TEZ_TURU_CHOICES = (
        ('YUKSEK_LISANS','Yüksek Lisans'),
        ('DOKTORA','Doktora/Sanatta Yeterlik'),
        ('TIP_DIS_UZMANLIK','Tıp/Diş Uzmanlık'),
    )
    aday_faaliyet = models.OneToOneField('basvuru.AdayFaaliyet', on_delete=models.CASCADE, related_name="tez_danismanligi_detay")
    ogrenci_adi = models.CharField(max_length=255, verbose_name="Öğrenci Adı")
    tez_konusu = models.CharField(max_length=255, verbose_name="Tez Konusu")
    tez_turu = models.CharField(max_length=20, choices=TEZ_TURU_CHOICES, verbose_name="Tez Türü")
    tamamlanma_tarihi = models.DateField(verbose_name="Tamamlanma Tarihi")
    es_danisman_mi = models.BooleanField(default=False, verbose_name="Eş Danışman mı?")

    class Meta:
        verbose_name = 'Tez Danışmanlığı Detay'
        verbose_name_plural = 'Tez Danışmanlığı Detayları'

class ProjeDetay(models.Model):
    PROJE_TURU_CHOICES = (
        ('AB','AB Çerçeve'),
        ('TUBITAK','TÜBİTAK'),
        ('KALKINMA_AJANSI','Kalkınma Ajansı'),
        ('SANAYI','Sanayi'),
        ('BAP','BAP'),
        ('DIGER','Diğer'),
    )
    PROJE_ROLU_CHOICES = (
        ('KOORDINATOR','Koordinatör'),
        ('YURUTUCU','Yürütücü'),
        ('ARASTIRMACI','Araştırmacı'),
        ('DANISMAN','Danışman'),
    )
    aday_faaliyet = models.OneToOneField('basvuru.AdayFaaliyet', on_delete=models.CASCADE, related_name="proje_detay")
    proje_turu = models.CharField(max_length=20, choices=PROJE_TURU_CHOICES, verbose_name="Proje Türü")
    proje_rolu = models.CharField(max_length=15, choices=PROJE_ROLU_CHOICES, verbose_name="Proje Rolü")
    proje_butcesi = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Proje Bütçesi")
    baslangic_tarihi = models.DateField(verbose_name="Başlangıç Tarihi")
    bitis_tarihi = models.DateField(blank=True, null=True, verbose_name="Bitiş Tarihi")
    destekleyen_kurulus = models.CharField(max_length=255, verbose_name="Destekleyen Kuruluş")

    class Meta:
        verbose_name = 'Proje Detay'
        verbose_name_plural = 'Proje Detayları'

class SanatsalFaaliyetDetay(models.Model):
    ETKINLIK_TURU_CHOICES = (
        ('KISISEL','Kişisel'),
        ('KARMA','Karma'),
        ('RESITAL','Resital'),
        ('KONSER','Konser'),
        ('DIGER','Diğer'),
    )
    aday_faaliyet = models.OneToOneField('basvuru.AdayFaaliyet', on_delete=models.CASCADE, related_name="sanatsal_faaliyet_detay")
    etkinlik_turu = models.CharField(max_length=10, choices=ETKINLIK_TURU_CHOICES, verbose_name="Etkinlik Türü")
    etkinlik_yeri = models.CharField(max_length=255, verbose_name="Etkinlik Yeri")
    etkinlik_tarihi = models.DateField(verbose_name="Etkinlik Tarihi")
    uluslararasi_mi = models.BooleanField(default=False, verbose_name="Uluslararası mı?")

    class Meta:
        verbose_name = 'Sanatsal Faaliyet Detay'
        verbose_name_plural = 'Sanatsal Faaliyet Detayları'
