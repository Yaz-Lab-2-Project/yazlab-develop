from rest_framework import viewsets
from .models import AtamaKriteri
from .serializers import AtamaKriteriSerializer

class AtamaKriteriViewSet(viewsets.ModelViewSet):
    queryset = AtamaKriteri.objects.all()
    serializer_class = AtamaKriteriSerializer