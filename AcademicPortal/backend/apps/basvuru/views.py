from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Basvuru, AdayFaaliyet, BasvuruSonuc, Tablo5
from .serializers import (
    BasvuruSerializer, AdayFaaliyetSerializer,
    BasvuruSonucSerializer, Tablo5Serializer
)

class BasvuruViewSet(viewsets.ModelViewSet):
    queryset = Basvuru.objects.all()
    serializer_class = BasvuruSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Kullanıcının yetkisine göre başvuruları filtrele
        """
        queryset = Basvuru.objects.all()
        user = self.request.user
        
        # İlan ID'sine göre filtreleme
        ilan_id = self.request.query_params.get('ilan_id', None)
        if ilan_id:
            queryset = queryset.filter(ilan_id=ilan_id)
            
        return queryset

class AdayFaaliyetViewSet(viewsets.ModelViewSet):
    queryset = AdayFaaliyet.objects.all()
    serializer_class = AdayFaaliyetSerializer
    permission_classes = [IsAuthenticated]

class BasvuruSonucViewSet(viewsets.ModelViewSet):
    queryset = BasvuruSonuc.objects.all()
    serializer_class = BasvuruSonucSerializer
    permission_classes = [IsAuthenticated]

class Tablo5ViewSet(viewsets.ModelViewSet):
    queryset = Tablo5.objects.all()
    serializer_class = Tablo5Serializer
    permission_classes = [IsAuthenticated]