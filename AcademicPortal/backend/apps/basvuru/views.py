from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import IntegrityError
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

    def get_serializer_context(self):
        """Add request to serializer context"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            self.perform_create(serializer)
        except IntegrityError:
            return Response(
                {"message": "Bu ilana zaten başvuru yaptınız. Aynı ilana tekrar başvuru yapamazsınız."},
                status=status.HTTP_400_BAD_REQUEST
            )
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save(aday=self.request.user)

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