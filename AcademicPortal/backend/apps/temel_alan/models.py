from django.db import models

class TemelAlan(models.Model):
    ad = models.CharField(
        max_length=255,
        verbose_name="Temel Alan Adı"
    )

    class Meta:
        verbose_name = 'Temel Alan'
        verbose_name_plural = 'Temel Alanlar'

    def __str__(self):
        return self.ad
