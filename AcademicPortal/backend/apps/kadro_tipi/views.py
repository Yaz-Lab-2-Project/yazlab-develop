from rest_framework import viewsets
from .models import KadroTipi
from .serializers import KadroTipiSerializer

class KadroTipiViewSet(viewsets.ModelViewSet):
    queryset = KadroTipi.objects.all()
    serializer_class = KadroTipiSerializer