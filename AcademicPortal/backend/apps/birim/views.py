from rest_framework import viewsets
from .models import Birim
from .serializers import BirimSerializer

class BirimViewSet(viewsets.ModelViewSet):
    queryset = Birim.objects.all()
    serializer_class = BirimSerializer