import os
from pathlib import Path

# BASE_DIR: projenin kök dizini
BASE_DIR = Path(__file__).resolve().parent.parent

# Güvenlik
SECRET_KEY = 'dupxm%*6-!31f1abhd&x-_sj_v%u=p^w+49vtyi+b2%&8jm_=&'
DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# Uygulamalar
INSTALLED_APPS = [
    # Django yerleşik
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',

    # Üçüncü taraf
    'rest_framework',
    'rest_framework.authtoken',
    'dj_rest_auth',
    'corsheaders',

    # Proje app'leri
    'apps.users',
    'apps.ilanlar',
    'apps.temel_alan',
    'apps.birim',
    'apps.bolum',
    'apps.anabilim_dali',
    'apps.kadro_tipi',
    'apps.basvuru',
    'apps.faaliyet',
    'apps.juri',
    'apps.sistem_ayarlari',
    'apps.belge_sablonu',
    'apps.log_kaydi',
    'apps.atama_kriteri',
    'apps.bildirim',
]

SITE_ID = 1

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS ayarları
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]

# CSRF güvenilir originler
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]

ROOT_URLCONF = 'academic_portal.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            BASE_DIR / 'templates',
            BASE_DIR.parent / 'frontend' / 'dist',
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'academic_portal.wsgi.application'

# Veritabanı (SQLite)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_USER_MODEL = 'users.User'

# Parola doğrulayıcılar
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Lokalizasyon
LANGUAGE_CODE = 'tr-TR'
TIME_ZONE = 'Europe/Istanbul'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Statik dosyalar (CSS/JS/Assets)
STATIC_URL = '/assets/'
STATICFILES_DIRS = [
    BASE_DIR.parent / 'frontend' / 'dist' / 'assets',
]
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Medya dosyaları (kullanıcı yüklemeleri)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# dj-rest-auth ayarları
REST_AUTH = {
    'USER_DETAILS_SERIALIZER': 'apps.users.serializers.UserSerializer',
    'TOKEN_SERIALIZER': 'dj_rest_auth.serializers.TokenSerializer',
    'JWT_AUTH_COOKIE': None,
    'JWT_AUTH_REFRESH_COOKIE': None,
    'USE_JWT': False,
    'SESSION_LOGIN': True,
}

# Session ve CSRF ayarları
SESSION_COOKIE_SECURE = False  # Development için False
CSRF_COOKIE_SECURE = False    # Development için False
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = False

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
