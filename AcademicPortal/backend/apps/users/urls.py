# apps/users/urls.py

from django.urls import path
# from . import views # Eğer bu app içinde başka view'leriniz olursa import edersiniz

app_name = 'users' # App ismi tanımlamak iyi bir pratiktir

urlpatterns = [
    # Şu anda bu app için özel bir URL tanımlamıyoruz.
    # İleride kullanıcı profili, özel ayarlar vb. için buraya eklenebilir.
    # Örnek: path('profile/', views.user_profile_view, name='user-profile'),
]