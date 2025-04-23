from rest_framework import viewsets
from .models import Bolum
from .serializers import BolumSerializer

class BolumViewSet(viewsets.ModelViewSet):
    queryset = Bolum.objects.all()
    serializer_class = BolumSerializer