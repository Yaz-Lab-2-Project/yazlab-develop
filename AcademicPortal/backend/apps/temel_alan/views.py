from rest_framework import viewsets
from .models import TemelAlan
from .serializers import TemelAlanSerializer

class TemelAlanViewSet(viewsets.ModelViewSet):
    queryset = TemelAlan.objects.all()
    serializer_class = TemelAlanSerializer