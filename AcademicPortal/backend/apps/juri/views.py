# apps/juri/views.py

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Count, Q
from .models import JuriAtama, JuriDegerlendirme
from .serializers import JuriAtamaSerializer, JuriDegerlendirmeSerializer, JuriAtamaDetaySerializer, JuriAtamaBasvuruDetaySerializer
from apps.ilanlar.models import Ilan
from apps.basvuru.models import Basvuru

# ---- Mevcut ViewSet'leriniz ----
class JuriAtamaViewSet(viewsets.ModelViewSet):
    queryset = JuriAtama.objects.all()
    serializer_class = JuriAtamaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        # Eğer my_assignments parametresi varsa, sadece kullanıcının atamalarını getir
        if self.request.query_params.get('my_assignments') == 'true':
            queryset = queryset.filter(juri_uyesi=self.request.user)
        return queryset

    def perform_create(self, serializer):
        serializer.save(juri_uyesi=self.request.user)

    @action(detail=False, methods=['get'], url_path='detayli')
    def detayli(self, request):
        queryset = self.get_queryset()
        serializer = JuriAtamaDetaySerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='basvuru-detayli')
    def basvuru_detayli(self, request):
        queryset = self.get_queryset()
        serializer = JuriAtamaBasvuruDetaySerializer(queryset, many=True)
        return Response(serializer.data)

class JuriDegerlendirmeViewSet(viewsets.ModelViewSet):
    queryset = JuriDegerlendirme.objects.all()
    serializer_class = JuriDegerlendirmeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        # Eğer my_evaluations parametresi varsa, sadece kullanıcının değerlendirmelerini getir
        if self.request.query_params.get('my_evaluations') == 'true':
            queryset = queryset.filter(juri_atama__juri_uyesi=self.request.user)
        return queryset

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['get'])
    def basvuru_detay(self, request, pk=None):
        degerlendirme = self.get_object()
        basvuru = degerlendirme.basvuru
        return Response({
            'basvuru_id': basvuru.id,
            'basvuru_durumu': basvuru.durum,
            'basvuru_tarihi': basvuru.basvuru_tarihi,
            'basvuru_notu': basvuru.basvuru_notu,
            'basvuru_dosyalari': [dosya.url for dosya in basvuru.basvuru_dosyalari.all()]
        })

# ---- YENİ EKLENECEK VIEW FONKSİYONU ----
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_jury_dashboard_stats(request):
    """
    Jüri üyesi için dashboard istatistiklerini hesaplar ve döndürür.
    """
    if getattr(request.user, 'user_type', None) != 'JURI':
        return Response({"detail": "Bu sayfaya erişim yetkiniz yok."}, 
                      status=status.HTTP_403_FORBIDDEN)

    try:
        # Toplam atanan başvuru sayısı
        total_assignments = JuriAtama.objects.filter(juri_uyesi=request.user).count()

        # Tamamlanan değerlendirme sayısı
        completed_evaluations = JuriDegerlendirme.objects.filter(
            juri_atama__juri_uyesi=request.user
        ).count()

        # Bekleyen rapor sayısı
        pending_reports = total_assignments - completed_evaluations

        stats_data = {
            'totalApplications': total_assignments,
            'completedEvaluations': completed_evaluations,
            'pendingReports': max(0, pending_reports)
        }
        return Response(stats_data)

    except Exception as e:
        print(f"Error calculating jury stats for user {request.user.id}: {e}")
        return Response(
            {"detail": "İstatistikler hesaplanırken sunucu hatası oluştu."}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )