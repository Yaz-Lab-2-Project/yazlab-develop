from rest_framework import viewsets
from .models import AnabilimDali
from .serializers import AnabilimDaliSerializer

class AnabilimDaliViewSet(viewsets.ModelViewSet):
    queryset = AnabilimDali.objects.all()
    serializer_class = AnabilimDaliSerializer