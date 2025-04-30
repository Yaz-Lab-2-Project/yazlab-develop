# apps/users/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'users' # App ismi tanımlamak iyi bir pratiktir

router = DefaultRouter()
router.register(r'', views.UserViewSet, basename='user')

urlpatterns = [
    # Public registration endpoint - should be BEFORE router include
    path('register/', views.register_user, name='register'), 
    # General API routing 
    path('', include(router.urls)),
    path('csrf/', views.set_csrf_token, name='csrf'),
    # Şu anda bu app için özel bir URL tanımlamıyoruz.
    # İleride kullanıcı profili, özel ayarlar vb. için buraya eklenebilir.
    # Örnek: path('profile/', views.user_profile_view, name='user-profile'),
]