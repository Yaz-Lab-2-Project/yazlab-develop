from rest_framework import viewsets
from .models import JuriAtama, JuriDegerlendirme
from .serializers import JuriAtamaSerializer, JuriDegerlendirmeSerializer

class JuriAtamaViewSet(viewsets.ModelViewSet):
    queryset = JuriAtama.objects.all()
    serializer_class = JuriAtamaSerializer

class JuriDegerlendirmeViewSet(viewsets.ModelViewSet):
    queryset = JuriDegerlendirme.objects.all()
    serializer_class = JuriDegerlendirmeSerializer