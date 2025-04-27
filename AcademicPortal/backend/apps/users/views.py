# apps/users/views.py

from rest_framework import viewsets, permissions, status
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes as func_permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import UserSerializer

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filtreleme ve arama için queryset'i özelleştir
        """
        queryset = User.objects.all()
        tc_kimlik = self.request.query_params.get('TC_KIMLIK', None)
        user_type = self.request.query_params.get('user_type', None)
        
        if tc_kimlik:
            queryset = queryset.filter(TC_KIMLIK=tc_kimlik)
        if user_type:
            queryset = queryset.filter(user_type=user_type)
            
        return queryset

    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Giriş yapmış kullanıcının bilgilerini döndürür
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def options(self, request):
        """
        Dropdown menüler için kullanıcı seçeneklerini döndürür
        """
        user_type = request.query_params.get('user_type', None)
        queryset = self.get_queryset()
        
        if user_type:
            queryset = queryset.filter(user_type=user_type)
            
        users = queryset.values('id', 'first_name', 'last_name', 'TC_KIMLIK')
        return Response(users)

@ensure_csrf_cookie
@api_view(['GET'])
@func_permission_classes([AllowAny])
def set_csrf_token(request):
    """Bu view sadece CSRF çerezinin yanıta eklenmesini sağlar."""
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