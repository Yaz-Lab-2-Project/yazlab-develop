from django.db import models

class KadroTipi(models.Model):
    KADRO_TIPI_CHOICES = (
        ('DR_OGR_UYESI', 'Dr. Öğretim Üyesi'),
        ('DOCENT', 'Doçent'),
        ('PROFESOR', 'Profesör'),
    )
    tip = models.CharField(max_length=20, choices=KADRO_TIPI_CHOICES, unique=True)

    class Meta:
        verbose_name = 'Kadro Tipi'
        verbose_name_plural = 'Kadro Tipleri'

    def __str__(self):
        return self.get_tip_display()
