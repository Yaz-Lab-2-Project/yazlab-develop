from rest_framework import viewsets
from .models import Ilan
from .serializers import IlanSerializer

class IlanViewSet(viewsets.ModelViewSet):
    queryset = Ilan.objects.all()
    serializer_class = IlanSerializer