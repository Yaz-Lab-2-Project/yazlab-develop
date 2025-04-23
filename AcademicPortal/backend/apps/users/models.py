from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    TC_KIMLIK = models.CharField(
        max_length=11,
        unique=True,
        verbose_name="TC Kimlik Numarası"
    )

    USER_TYPE_CHOICES = (
        ('ADAY', 'Aday'),
        ('ADMIN', 'Admin'),
        ('YONETICI', 'Yönetici'),
        ('JURI', 'Jüri Üyesi'),
    )
    user_type = models.CharField(
        max_length=10,
        choices=USER_TYPE_CHOICES,
        default='ADAY'
    )
    telefon = models.CharField(max_length=15, blank=True, null=True)
    adres = models.TextField(blank=True, null=True)
    akademik_unvan = models.ForeignKey(
        'kadro_tipi.KadroTipi',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="kullanicilar",
        verbose_name="Akademik Ünvan"
    )

    class Meta:
        verbose_name = 'Kullanıcı'
        verbose_name_plural = 'Kullanıcılar'

    def __str__(self):
        unvan = self.akademik_unvan.get_tip_display() if self.akademik_unvan else ""
        return f"{unvan} {self.first_name} {self.last_name} ({self.get_user_type_display()})"
