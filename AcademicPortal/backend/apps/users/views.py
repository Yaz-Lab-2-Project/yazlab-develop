# apps/users/views.py

from rest_framework import viewsets, permissions
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes as func_permission_classes # İsim çakışmasın diye
from rest_framework.permissions import AllowAny, IsAdminUser # İzinleri import et

# ===> User modelini ve serializer'ını import et <===
# from .models import User # Eğer model bu app içindeyse
from django.contrib.auth import get_user_model
User = get_user_model() # Aktif User modelini al
from .serializers import UserSerializer


# ===> YENİ UserViewSet <===
class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    Restricted to admin users.
    """
    queryset = User.objects.all().order_by('-date_joined') # Tüm kullanıcıları al, en yeniden eskiye sırala
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser] # Sadece Yöneticiler/Staff erişebilir

    # İsteğe bağlı: Filtreleme, arama, sıralama ekleyebilirsiniz
    # from django_filters.rest_framework import DjangoFilterBackend
    # from rest_framework.filters import SearchFilter, OrderingFilter
    # filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    # filterset_fields = ['user_type', 'is_active'] # Filtrelenecek alanlar
    # search_fields = ['username', 'first_name', 'last_name', 'email', 'TC_KIMLIK'] # Aranacak alanlar
    # ordering_fields = ['username', 'email', 'date_joined', 'last_login', 'is_active', 'user_type'] # Sıralanacak alanlar
    # ordering = ['-date_joined'] # Varsayılan sıralama


# --- CSRF Token Ayarlama View Fonksiyonu (Mevcut kod) ---
@ensure_csrf_cookie
@api_view(['GET'])
@func_permission_classes([AllowAny]) # İsmi değiştirdik
def set_csrf_token(request):
    """ Bu view sadece CSRF çerezinin yanıta eklenmesini sağlar. """
    return JsonResponse({"detail": "CSRF cookie should be set"})

# --- Özel Login/Logout View'leriniz (Artık Kullanılmıyor Olmalı) ---
# from django.contrib.auth import authenticate, login, logout
# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# import json

# @csrf_exempt
# def login_view(request): ... (Bu fonksiyon artık dj_rest_auth kullanıldığı için gereksiz)

# @csrf_exempt
# def logout_view(request): ... (Bu fonksiyon artık dj_rest_auth kullanıldığı için gereksiz)