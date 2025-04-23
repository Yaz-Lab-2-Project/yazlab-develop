# AcademicPortal/backend/academic_portal/settings.py

import os
from pathlib import Path

# BASE_DIR: projenin kök dizini
BASE_DIR = Path(__file__).resolve().parent.parent

# Güvenlik: kendi SECRET_KEY’inizi üretip buraya koyun
SECRET_KEY = 'dupxm%*6-!31f1abhd&x-_sj_v%u=p^w+49vtyi+b2%&8jm_=&'

# Geliştirme aşamasında DEBUG=True, canlıda False
DEBUG = True

# İzin verilen hostlar (canlı ortamda domaine göre düzenleyin)
ALLOWED_HOSTS = []

# Uygulamalar
INSTALLED_APPS = [
    # Django yerleşik app’leri
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Üçüncü taraf
    'rest_framework',

    # Projenin app’leri
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

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'academic_portal.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [ BASE_DIR / 'templates' ],
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

# Veritabanı: SQLite (ayar gerekmiyorsa olduğu gibi bırakabilirsiniz)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Özel kullanıcı modelimizi kullanıyoruz
AUTH_USER_MODEL = 'users.User'

# Parola doğrulayıcılar
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Dil ve saat dilimi
LANGUAGE_CODE = 'tr-TR'
TIME_ZONE = 'Europe/Istanbul'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Statik dosyalar (CSS, JS, img)
STATIC_URL = '/static/'
STATICFILES_DIRS = [ BASE_DIR / 'static' ]
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Medya dosyaları (kullanıcı yüklemeleri)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Django REST Framework (gerekiyorsa özelleştirin)
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# Varsayılan auto field
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
