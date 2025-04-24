from rest_framework import viewsets
from .models import User
from .serializers import UserSerializer

from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer



@api_view(['POST'])
@permission_classes([AllowAny])          # Giriş uç noktasına anonim erişim izni
@ensure_csrf_cookie                       # Önce CSRF cookie’sini yerleştir
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)              # Django session oturumu başlatır
        return Response({'detail': 'Giriş başarılı.'})
    return Response({'detail': 'Kullanıcı adı veya şifre hatalı.'},
                    status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def logout_view(request):
    logout(request)                       # Session’ı temizler
    return Response({'detail': 'Çıkış yapıldı.'})