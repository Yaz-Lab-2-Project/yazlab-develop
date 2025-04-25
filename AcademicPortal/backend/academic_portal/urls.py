from django.contrib import admin
from django.urls import path, include
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
    BasvuruViewSet, AdayFaaliyetViewSet,
    BasvuruSonucViewSet, Tablo5ViewSet
)
from apps.juri.views import JuriAtamaViewSet, JuriDegerlendirmeViewSet
from apps.bildirim.views import BildirimViewSet

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
router.register(r' aday-faaliyetler', AdayFaaliyetViewSet)
router.register(r'basvuru-sonuclar', BasvuruSonucViewSet)
router.register(r'tablo5', Tablo5ViewSet)
router.register(r'juri-atamalar', JuriAtamaViewSet)
router.register(r'juri-degerlendirmeler', JuriDegerlendirmeViewSet)
router.register(r'bildirimler', BildirimViewSet)

urlpatterns = [
  path('admin/', admin.site.urls),
  path('api/', include(router.urls)),
  path('api/', include('apps.users.urls')),
]



