from rest_framework import viewsets
from .models import Bildirim
from .serializers import BildirimSerializer

class BildirimViewSet(viewsets.ModelViewSet):
    queryset = Bildirim.objects.all()
    serializer_class = BildirimSerializer