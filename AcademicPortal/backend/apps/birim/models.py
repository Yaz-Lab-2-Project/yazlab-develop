from django.db import models
from apps.temel_alan.models import TemelAlan

class Birim(models.Model):
    ad = models.CharField(max_length=255, verbose_name="Birim Adı")
    temel_alan = models.ForeignKey(TemelAlan, on_delete=models.CASCADE, related_name="birimler")

    class Meta:
        verbose_name = 'Birim'
        verbose_name_plural = 'Birimler'

    def __str__(self):
        return self.ad
