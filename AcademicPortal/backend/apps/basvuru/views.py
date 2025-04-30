from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import IntegrityError
from .models import Basvuru, AdayFaaliyet, BasvuruSonuc, Tablo5, DegerlendirmeBelgesi
from .serializers import (
    BasvuruSerializer, AdayFaaliyetSerializer,
    BasvuruSonucSerializer, Tablo5Serializer,
    DegerlendirmeBelgesiSerializer
)
import logging

logger = logging.getLogger(__name__)

class BasvuruViewSet(viewsets.ModelViewSet):
    queryset = Basvuru.objects.all()
    serializer_class = BasvuruSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Kullanıcının yetkisine göre başvuruları filtrele
        """
        queryset = Basvuru.objects.all()
        user = self.request.user
        
        # İlan ID'sine göre filtreleme
        ilan_id = self.request.query_params.get('ilan_id', None)
        if ilan_id:
            queryset = queryset.filter(ilan_id=ilan_id)
            
        return queryset

    def get_serializer_context(self):
        """Add request to serializer context"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            self.perform_create(serializer)
        except IntegrityError:
            return Response(
                {"message": "Bu ilana zaten başvuru yaptınız. Aynı ilana tekrar başvuru yapamazsınız."},
                status=status.HTTP_400_BAD_REQUEST
            )
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save(aday=self.request.user)

    @action(detail=True, methods=['get'])
    def academic_activities(self, request, pk=None):
        basvuru = self.get_object()
        faaliyetler = basvuru.aday_faaliyetler.all()
        
        # Faaliyetleri türlerine göre grupla
        activities = {
            'articles': [],
            'projects': [],
            'conferences': [],
            'teaching': [],
            'citations': [],
            'patents': []
        }
        
        for faaliyet in faaliyetler:
            if faaliyet.faaliyet.tur == 'MAKALE':
                activities['articles'].append({
                    'id': faaliyet.id,
                    'baslik': faaliyet.baslik,
                    'aciklama': faaliyet.aciklama,
                    'index': faaliyet.faaliyet.index,
                    'yazar_sayisi': faaliyet.yazar_sayisi,
                    'baslica_yazar_mi': faaliyet.baslica_yazar_mi,
                    'kisi_puani': faaliyet.kisi_puani
                })
            elif faaliyet.faaliyet.tur == 'PROJE':
                activities['projects'].append({
                    'id': faaliyet.id,
                    'baslik': faaliyet.baslik,
                    'aciklama': faaliyet.aciklama,
                    'kisi_puani': faaliyet.kisi_puani
                })
            elif faaliyet.faaliyet.tur == 'KONFERANS':
                activities['conferences'].append({
                    'id': faaliyet.id,
                    'baslik': faaliyet.baslik,
                    'aciklama': faaliyet.aciklama,
                    'kisi_puani': faaliyet.kisi_puani
                })
            elif faaliyet.faaliyet.tur == 'EGITIM':
                activities['teaching'].append({
                    'id': faaliyet.id,
                    'baslik': faaliyet.baslik,
                    'aciklama': faaliyet.aciklama,
                    'kisi_puani': faaliyet.kisi_puani
                })
            elif faaliyet.faaliyet.tur == 'ATIF':
                activities['citations'].append({
                    'id': faaliyet.id,
                    'baslik': faaliyet.baslik,
                    'aciklama': faaliyet.aciklama,
                    'kisi_puani': faaliyet.kisi_puani
                })
            elif faaliyet.faaliyet.tur == 'PATENT':
                activities['patents'].append({
                    'id': faaliyet.id,
                    'baslik': faaliyet.baslik,
                    'aciklama': faaliyet.aciklama,
                    'kisi_puani': faaliyet.kisi_puani
                })
        
        return Response(activities)

    @action(detail=True, methods=['get'])
    def degerlendirme_belgeleri(self, request, pk=None):
        """Başvuruya ait değerlendirme belgelerini listeler"""
        try:
            # İlgili başvuruyu al
            basvuru = self.get_object()
            
            # Bağlı değerlendirme belgelerini çek
            belgeler = DegerlendirmeBelgesi.objects.filter(basvuru=basvuru)
            
            # Serialize et ve döndür
            serializer = DegerlendirmeBelgesiSerializer(belgeler, many=True, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Değerlendirme belgeleri getirilirken hata: {str(e)}")
            return Response(
                {'error': f'Değerlendirme belgeleri alınırken hata oluştu: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'], url_path='degerlendirme_belgesi_yukle')
    def degerlendirme_belgesi_yukle(self, request, pk=None):
        """Başvuruya değerlendirme belgesi yükler"""
        try:
            # İlgili başvuruyu al
            basvuru = self.get_object()
            
            # Belge dosyasını kontrol et
            if 'belge' not in request.data:
                return Response(
                    {'error': 'Yüklenecek belge bulunamadı.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Formdata oluştur
            form_data = {
                'belge': request.data['belge'],
                'basvuru': basvuru.id
            }
            
            # Belge adı varsa ekle
            if 'belge_adi' in request.data:
                form_data['belge_adi'] = request.data['belge_adi']
            
            # Serializer ile doğrula ve kaydet
            serializer = DegerlendirmeBelgesiSerializer(data=form_data, context={'request': request})
            if serializer.is_valid():
                # Belgeyi kaydet
                belge = serializer.save(basvuru=basvuru, yukleyen=request.user)
                
                # Başarılı yanıt döndür
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                # Doğrulama hatalarını döndür
                logger.error(f"Belge yükleme doğrulama hatası: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Hata durumunu logla ve döndür
            logger.error(f"Belge yüklenirken hata: {str(e)}")
            return Response(
                {'error': f'Belge yüklenirken bir hata oluştu: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['delete'], url_path='degerlendirme_belgesi/(?P<belge_id>[^/.]+)')
    def degerlendirme_belgesi_sil(self, request, pk=None, belge_id=None):
        """Bir değerlendirme belgesini siler"""
        try:
            # İlgili başvuruyu ve belgeyi bul
            basvuru = self.get_object()
            
            # Belgeyi sil
            try:
                belge = DegerlendirmeBelgesi.objects.get(id=belge_id, basvuru=basvuru)
                belge.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            except DegerlendirmeBelgesi.DoesNotExist:
                return Response(
                    {'error': 'Belge bulunamadı'},
                    status=status.HTTP_404_NOT_FOUND
                )
        except Exception as e:
            logger.error(f"Belge silinirken hata: {str(e)}")
            return Response(
                {'error': f'Belge silinirken bir hata oluştu: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AdayFaaliyetViewSet(viewsets.ModelViewSet):
    queryset = AdayFaaliyet.objects.all()
    serializer_class = AdayFaaliyetSerializer
    permission_classes = [IsAuthenticated]

class BasvuruSonucViewSet(viewsets.ModelViewSet):
    queryset = BasvuruSonuc.objects.all()
    serializer_class = BasvuruSonucSerializer
    permission_classes = [IsAuthenticated]

class Tablo5ViewSet(viewsets.ModelViewSet):
    queryset = Tablo5.objects.all()
    serializer_class = Tablo5Serializer
    permission_classes = [IsAuthenticated]