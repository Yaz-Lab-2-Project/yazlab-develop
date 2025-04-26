# academic_portal/urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# --- Gerekli ViewSet ve View Importları ---
# Her app için ViewSet'leri doğrudan import etmek genellikle daha nettir
from apps.temel_alan.views import TemelAlanViewSet
from apps.birim.views import BirimViewSet
from apps.bolum.views import BolumViewSet
from apps.anabilim_dali.views import AnabilimDaliViewSet
from apps.kadro_tipi.views import KadroTipiViewSet
from apps.ilanlar.views import IlanViewSet # IlanViewSet doğrudan import edildi
from apps.sistem_ayarlari.views import SistemAyarlariViewSet
from apps.belge_sablonu.views import BelgeSablonuViewSet
from apps.log_kaydi.views import LogKaydiViewSet
from apps.atama_kriteri.views import AtamaKriteriViewSet
from apps.basvuru.views import (
    BasvuruViewSet, AdayFaaliyetViewSet,
    BasvuruSonucViewSet, Tablo5ViewSet
)
from apps.juri.views import JuriAtamaViewSet, JuriDegerlendirmeViewSet
from apps.bildirim.views import BildirimViewSet
from apps.users.views import UserViewSet

# Fonksiyon bazlı view'leri import et (gerekirse alias ile)
from apps.juri import views as juri_views # get_jury_dashboard_stats için
from apps.users import views as user_views # set_csrf_token için
from apps.ilanlar import views as ilan_views # get_manager_dashboard_data için
from apps.ilanlar import views as ilan_views


# --- DRF Router ---
router = DefaultRouter()

# ViewSet'leri router'a kaydet (doğrudan isimleriyle)
router.register(r'temel-alan', TemelAlanViewSet)
router.register(r'birim', BirimViewSet)
router.register(r'bolum', BolumViewSet)
router.register(r'anabilim-dali', AnabilimDaliViewSet)
router.register(r'kadro-tipi', KadroTipiViewSet)
# ===> DÜZELTME: Doğrudan IlanViewSet kullanıldı <====
router.register(r'ilanlar', IlanViewSet)
router.register(r'sistem-ayarlari', SistemAyarlariViewSet)
router.register(r'belge-sablonlari', BelgeSablonuViewSet)
router.register(r'log-kayitlari', LogKaydiViewSet)
router.register(r'atama-kriterleri', AtamaKriteriViewSet)
router.register(r'basvurular', BasvuruViewSet)
router.register(r'aday-faaliyetler', AdayFaaliyetViewSet)
router.register(r'basvuru-sonuclar', BasvuruSonucViewSet)
router.register(r'tablo5', Tablo5ViewSet)
router.register(r'juri-atamalar', JuriAtamaViewSet)
router.register(r'juri-degerlendirmeler', JuriDegerlendirmeViewSet)
router.register(r'bildirimler', BildirimViewSet)
router.register(r'users', UserViewSet, basename='user')



# --- Ana URL Pattern'leri ---
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/set-csrf/', user_views.set_csrf_token, name='set-csrf'),
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/jury-stats/', juri_views.get_jury_dashboard_stats, name='jury-stats'),
    # ===> ilan_views alias'ı burada doğru şekilde kullanılıyor <====
    path('api/manager-stats/', ilan_views.get_manager_dashboard_data, name='manager-stats'),
        path('api/admin-stats/', ilan_views.get_admin_dashboard_data, name='admin-stats'),

    path('api/', include(router.urls)), # Router en sonda
]

# --- Statik/Medya Ayarları ---
from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    # urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)