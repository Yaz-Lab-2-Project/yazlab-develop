from rest_framework import viewsets
from .models import LogKaydi
from .serializers import LogKaydiSerializer

class LogKaydiViewSet(viewsets.ModelViewSet):
    queryset = LogKaydi.objects.all()
    serializer_class = LogKaydiSerializer