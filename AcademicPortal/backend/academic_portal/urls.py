# academic_portal/urls.py

import os
from pathlib import Path

from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from rest_framework.routers import DefaultRouter

from apps.temel_alan.views import TemelAlanViewSet
from apps.birim.views import BirimViewSet
from apps.bolum.views import BolumViewSet
from apps.anabilim_dali.views import AnabilimDaliViewSet
from apps.kadro_tipi.views import KadroTipiViewSet
from apps.ilanlar.views import IlanViewSet
from apps.sistem_ayarlari.views import SistemAyarlariViewSet
from apps.belge_sablonu.views import BelgeSablonuViewSet
from apps.log_kaydi.views import LogKaydiViewSet
from apps.atama_kriteri.views import AtamaKriteriViewSet
from apps.basvuru.views import (
    BasvuruViewSet,
    AdayFaaliyetViewSet,
    BasvuruSonucViewSet,
    Tablo5ViewSet,
)
from apps.juri.views import JuriAtamaViewSet, JuriDegerlendirmeViewSet
from apps.bildirim.views import BildirimViewSet
from apps.users.views import UserViewSet

# function-based views
from apps.juri import views as juri_views
from apps.users import views as user_views
from apps.ilanlar import views as ilan_views

# Router tanımı
router = DefaultRouter()
router.register(r'temel-alan', TemelAlanViewSet)
router.register(r'birim', BirimViewSet)
router.register(r'bolum', BolumViewSet)
router.register(r'anabilim-dali', AnabilimDaliViewSet)
router.register(r'kadro-tipi', KadroTipiViewSet)
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

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # Auth & CSRF
    path('api/set-csrf/', user_views.set_csrf_token, name='set-csrf'),
    path('api/auth/', include('dj_rest_auth.urls')),

    # Dashboard istatistik endpoint’leri
    path('api/jury-stats/', juri_views.get_jury_dashboard_stats, name='jury-stats'),
    path('api/manager-stats/', ilan_views.get_manager_dashboard_data, name='manager-stats'),
    path('api/admin-stats/', ilan_views.get_admin_dashboard_data, name='admin-stats'),

    # DRF router’ı
    path('api/', include(router.urls)),
]

# --- Static & Media serve (Development) ---
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

# 1) STATIC_URL altındakiler
urlpatterns += staticfiles_urlpatterns()

# 2) MEDIA_URL altındakiler (DEBUG=True iken)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# --- SPA Catch-All: static/ veya media/ ile başlamayan tüm path’leri index.html’e yönlendir ---
urlpatterns += [
    path('', TemplateView.as_view(template_name='index.html'), name='frontend'),
    re_path(
        r'^(?!static/|media/).*$',
        TemplateView.as_view(template_name='index.html'),
        name='frontend-catch-all'
    ),
]
