from rest_framework import viewsets
from .models import BelgeSablonu
from .serializers import BelgeSablonuSerializer

class BelgeSablonuViewSet(viewsets.ModelViewSet):
    queryset = BelgeSablonu.objects.all()
    serializer_class = BelgeSablonuSerializer