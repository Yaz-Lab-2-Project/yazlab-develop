import os
from django.core.wsgi import get_wsgi_application

# Django'nun settings modülünü işaret edin
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academic_portal.settings')

# WSGI uygulaması
application = get_wsgi_application()
