from rest_framework import viewsets
from .models import Basvuru, AdayFaaliyet, BasvuruSonuc, Tablo5
from .serializers import (
    BasvuruSerializer, AdayFaaliyetSerializer,
    BasvuruSonucSerializer, Tablo5Serializer
)

class BasvuruViewSet(viewsets.ModelViewSet):
    queryset = Basvuru.objects.all()
    serializer_class = BasvuruSerializer

class AdayFaaliyetViewSet(viewsets.ModelViewSet):
    queryset = AdayFaaliyet.objects.all()
    serializer_class = AdayFaaliyetSerializer

class BasvuruSonucViewSet(viewsets.ModelViewSet):
    queryset = BasvuruSonuc.objects.all()
    serializer_class = BasvuruSonucSerializer

class Tablo5ViewSet(viewsets.ModelViewSet):
    queryset = Tablo5.objects.all()
    serializer_class = Tablo5Serializer