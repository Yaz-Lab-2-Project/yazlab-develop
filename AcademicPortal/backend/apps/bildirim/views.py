# apps/bildirim/views.py

from rest_framework import viewsets, permissions
from .models import Bildirim # Bildirim modelini import edin
from .serializers import BildirimSerializer # BildirimSerializer'ı import edin

class BildirimViewSet(viewsets.ReadOnlyModelViewSet): # Sadece okuma için ReadOnly varsaydık
    serializer_class = BildirimSerializer
    permission_classes = [permissions.IsAuthenticated] # Sadece giriş yapanlar

    # ====> EKSİK OLAN SATIR BUYDU <====
    # Router'ın modeli ve basename'i otomatik algılaması için temel queryset:
    queryset = Bildirim.objects.all()

    def get_queryset(self):
        """
        Sadece giriş yapmış kullanıcıya ait bildirimleri döndürür.
        Bu metot, yukarıdaki temel queryset'i override eder.
        """
        user = self.request.user
        # Doğrudan kullanıcıya göre filtrele
        return Bildirim.objects.filter(alici=user).order_by('-olusturulma_tarihi')