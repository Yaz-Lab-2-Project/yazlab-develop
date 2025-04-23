from django.db import models
from apps.birim.models import Birim

class Bolum(models.Model):
    ad = models.CharField(max_length=255, verbose_name="Bölüm Adı")
    birim = models.ForeignKey(Birim, on_delete=models.CASCADE, related_name="bolumler")

    class Meta:
        verbose_name = 'Bölüm'
        verbose_name_plural = 'Bölümler'

    def __str__(self):
        return self.ad
