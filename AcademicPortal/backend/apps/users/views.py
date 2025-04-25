from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({'detail': 'Giriş başarılı'})
        return JsonResponse({'detail': 'Geçersiz kullanıcı adı veya şifre'}, status=401)
    return JsonResponse({'detail': 'Yalnızca POST istekleri kabul edilir'}, status=405)

@csrf_exempt
def logout_view(request):
    if request.method == 'POST':
        logout(request)
        return JsonResponse({'detail': 'Çıkış başarılı'})
    return JsonResponse({'detail': 'Yalnızca POST istekleri kabul edilir'}, status=405)
