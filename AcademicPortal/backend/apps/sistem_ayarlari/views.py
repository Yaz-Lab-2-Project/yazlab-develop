from rest_framework import viewsets
from .models import SistemAyarlari
from .serializers import SistemAyarlariSerializer

class SistemAyarlariViewSet(viewsets.ModelViewSet):
    queryset = SistemAyarlari.objects.all()
    serializer_class = SistemAyarlariSerializer