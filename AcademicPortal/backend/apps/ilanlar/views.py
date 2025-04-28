# apps/ilanlar/views.py

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Q
# ===> DOĞRU USER MODELİ IMPORTU <====
from django.contrib.auth import get_user_model
User = get_user_model() # Aktif User modelini al

# Bu view dosyasının modelleri ve serializer'ı
from .models import Ilan
from .serializers import IlanSerializer

# Diğer app modelleri (doğru yollardan import edin)
from apps.basvuru.models import Basvuru
from apps.juri.models import JuriAtama, JuriDegerlendirme
# from apps.bolum.models import Bolum # Gerekiyorsa import edin


# --- IlanViewSet ---
class IlanViewSet(viewsets.ModelViewSet):
    queryset = Ilan.objects.all().order_by('-olusturulma_tarihi')
    serializer_class = IlanSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly] # İzinleri ayarlayın

    # ====> BU METOT ÖNEMLİ <====
    def perform_create(self, serializer):
        """Yeni ilan oluşturulurken 'olusturan' alanını otomatik olarak ayarlar."""
        serializer.save(olusturan=self.request.user)


# --- Yönetici Dashboard View Fonksiyonu ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_manager_dashboard_data(request):
    """
    Yönetici Paneli için özet verileri hesaplar ve döndürür.
    """
    # Kullanıcının yönetici olup olmadığını kontrol et
    if getattr(request.user, 'user_type', None) != 'YONETICI':
        return Response({"detail": "Bu sayfaya erişim yetkiniz yok."}, status=status.HTTP_403_FORBIDDEN)

    today = timezone.localdate()
    next_week = today + timedelta(days=7)
    try:
        # İstatistikler
        all_ilanlar = Ilan.objects.all()
        active_ilan_count = all_ilanlar.filter(aktif=True).count()
        total_ilan_count = all_ilanlar.count()
        today_basvuru_count = Basvuru.objects.filter(basvuru_tarihi__date=today).count()
        ongoing_application_statuses = ['Beklemede', 'Değerlendirmede', 'Jüri Atandı']
        ongoing_applications_count = Basvuru.objects.filter(durum__in=ongoing_application_statuses).count()
        completed_eval_count = JuriDegerlendirme.objects.count()
        past_due_assignments = JuriAtama.objects.filter(ilan__bitis_tarihi__date__lt=today)
        evaluated_past_due_count = JuriDegerlendirme.objects.filter(juri_atama__in=past_due_assignments).count()
        missing_reports_count = past_due_assignments.count() - evaluated_past_due_count
        most_applied = Ilan.objects.annotate(num_basvurular=Count('basvurular')).filter(num_basvurular__gt=0).order_by('-num_basvurular').first()
        most_applied_text = most_applied.baslik if most_applied else "-"
        stats = {
            'totalPostings': total_ilan_count, 'activePostings': active_ilan_count,
            'ongoingApplications': ongoing_applications_count, 'completedEvaluations': completed_eval_count,
            'missingReports': max(0, missing_reports_count), 'mostApplied': most_applied_text,
            'todayApplications': today_basvuru_count
        }
        # Yaklaşan Bitiş Tarihleri
        upcoming_deadlines_query = Ilan.objects.filter(aktif=True, bitis_tarihi__date__gte=today, bitis_tarihi__date__lte=next_week).order_by('bitis_tarihi').values('id', 'baslik', 'bitis_tarihi')[:5]
        upcoming_deadlines = list(upcoming_deadlines_query)
        # Bölümlere Göre Dağılım
        department_applications_query = Basvuru.objects.values('ilan__bolum__ad').annotate(value=Count('id')).order_by('-value')
        department_applications = [{'name': item['ilan__bolum__ad'], 'value': item['value']} for item in department_applications_query if item['ilan__bolum__ad']]
        # Uyarılar
        alerts = []
        unassigned_ilan_count = Ilan.objects.filter(aktif=True, juri_atamalari__isnull=True).distinct().count()
        if unassigned_ilan_count > 0: alerts.append({"id": "unassigned_jury", "type": "danger", "text": f"{unassigned_ilan_count} aktif ilan için jüri ataması yapılmamış."})
        # Veriyi Birleştir
        data = { 'stats': stats, 'upcomingDeadlines': upcoming_deadlines, 'departmentApplications': department_applications, 'alerts': alerts }
        return Response(data)
    except Exception as e:
        import traceback
        print("Error calculating manager dashboard data:")
        print(traceback.format_exc())
        return Response({"detail": f"Dashboard verileri hesaplanırken bir hata oluştu: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --- Admin Dashboard View Fonksiyonu ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_admin_dashboard_data(request):
    """
    Admin Paneli için özet verileri hesaplar ve döndürür.
    """
    try:
        # İstatistik Hesaplamaları
        all_ilanlar = Ilan.objects.all()
        total_postings = all_ilanlar.count()
        active_postings = all_ilanlar.filter(aktif=True).count()
        ongoing_apps_statuses = ['Beklemede', 'Değerlendirmede', 'Jüri Atandı']
        ongoing_applications = Basvuru.objects.filter(durum__in=ongoing_apps_statuses).count()
        most_applied_obj = Ilan.objects.annotate(num_basvurular=Count('basvurular')).filter(num_basvurular__gt=0).order_by('-num_basvurular').first()
        most_applied = most_applied_obj.baslik if most_applied_obj else "-"
        stats = {
            'totalPostings': total_postings, 'activePostings': active_postings,
            'ongoingApplications': ongoing_applications, 'mostApplied': most_applied,
            'totalUsers': User.objects.count(), # User modeli artık import edildi
            'totalApplications': Basvuru.objects.count(),
        }
        # Bölümlere Göre Başvuru Dağılımı
        department_apps_query = Basvuru.objects.values('ilan__bolum__ad').annotate(value=Count('id')).order_by('-value')
        department_applications = [{'name': item['ilan__bolum__ad'], 'value': item['value']} for item in department_apps_query if item['ilan__bolum__ad']]
        # Yanıt Verisi
        data = { 'stats': stats, 'departmentApplications': department_applications }
        return Response(data)
    except Exception as e:
        import traceback
        print(f"Admin dashboard verisi hesaplanırken hata: {e}")
        print(traceback.format_exc())
        return Response({"detail": "Dashboard verileri hesaplanırken sunucu hatası oluştu."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)