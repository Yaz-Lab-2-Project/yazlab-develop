from django.db import models
from apps.bolum.models import Bolum

class AnabilimDali(models.Model):
    ad = models.CharField(max_length=255, verbose_name="Anabilim Dalı Adı")
    bolum = models.ForeignKey(Bolum, on_delete=models.CASCADE, related_name="anabilim_dallari")

    class Meta:
        verbose_name = 'Anabilim Dalı'
        verbose_name_plural = 'Anabilim Dalları'

    def __str__(self):
        return self.ad
