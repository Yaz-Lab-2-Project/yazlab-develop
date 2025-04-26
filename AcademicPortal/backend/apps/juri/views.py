# apps/juri/views.py

from rest_framework import viewsets
from .models import JuriAtama, JuriDegerlendirme
from .serializers import JuriAtamaSerializer, JuriDegerlendirmeSerializer

# ---- Mevcut ViewSet'leriniz ----
class JuriAtamaViewSet(viewsets.ModelViewSet):
    queryset = JuriAtama.objects.all()
    serializer_class = JuriAtamaSerializer
    # Gerekirse permission_classes veya get_queryset ekleyebilirsiniz
    # Örneğin sadece yöneticilerin tüm atamaları görmesi için:
    # permission_classes = [IsAdminUser]

class JuriDegerlendirmeViewSet(viewsets.ModelViewSet):
    queryset = JuriDegerlendirme.objects.all()
    serializer_class = JuriDegerlendirmeSerializer
    # Gerekirse permission_classes veya get_queryset ekleyebilirsiniz
    # Örneğin jüri üyesinin sadece kendi değerlendirmelerini görmesi için:
    # permission_classes = [IsAuthenticated]
    # def get_queryset(self):
    #     user = self.request.user
    #     if getattr(user, 'user_type', None) == 'JURI':
    #          # İlişkili JuriAtama objesi üzerinden filtreleme
    #          return JuriDegerlendirme.objects.filter(juri_atama__juri_uyesi=user)
    #     # Başka roller veya admin tümünü görebilir (isteğe bağlı)
    #     # elif user.is_staff:
    #     #    return JuriDegerlendirme.objects.all()
    #     return JuriDegerlendirme.objects.none() # Yetkisizse boş döndür

# ---- YENİ EKLENECEK VIEW FONKSİYONU ----
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
# User modelini import etmeniz gerekebilir
# from apps.users.models import User

@api_view(['GET'])
@permission_classes([IsAuthenticated]) # Sadece giriş yapmış kullanıcılar erişsin
def get_jury_dashboard_stats(request):
    """
    Giriş yapmış jüri üyesi için dashboard istatistiklerini hesaplar ve döndürür.
    """
    juri_user = request.user

    # Kullanıcının jüri üyesi olup olmadığını kontrol et (user_type'a göre)
    if getattr(juri_user, 'user_type', None) != 'JURI':
         return Response({"detail": "Yetkisiz erişim."}, status=status.HTTP_403_FORBIDDEN)

    try:
        # Toplam atanan başvuru sayısı
        total_assignments = JuriAtama.objects.filter(juri_uyesi=juri_user).count()

        # Tamamlanan değerlendirme sayısı
        # Doğrudan Değerlendirme modeli üzerinden filtreleme daha doğru olabilir
        completed_evaluations = JuriDegerlendirme.objects.filter(juri_atama__juri_uyesi=juri_user).count()

        # Bekleyen rapor sayısı
        pending_reports = total_assignments - completed_evaluations

        stats_data = {
            'totalApplications': total_assignments,
            'completedEvaluations': completed_evaluations,
            'pendingReports': max(0, pending_reports) # Negatif olmaması için
        }
        return Response(stats_data)

    except Exception as e:
        # Hata durumunda loglama ve 500 hatası döndürme
        # Üretim ortamında daha detaylı loglama yapılmalı
        print(f"Error calculating jury stats for user {juri_user.id}: {e}")
        return Response({"detail": "İstatistikler hesaplanırken sunucu hatası oluştu."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)