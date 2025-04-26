# apps/users/serializers.py

from rest_framework import serializers
# ===> User modelini doğru yerden import edin <====
# Eğer User modeliniz Django'nun yerleşik User modeli DEĞİLSE, kendi modelinizi import edin:
# from .models import User
# Eğer Django'nun User modelini doğrudan KULLANMIYORSANIZ ama AbstractUser'dan türettiyseniz:
from django.contrib.auth import get_user_model
User = get_user_model() # Projedeki aktif User modelini alır

# KadroTipi'ni göstermek için (opsiyonel, eğer ilişkiliyse)
# from apps.kadro_tipi.serializers import KadroTipiSerializer # Veya sadece PrimaryKeyRelatedField

class UserSerializer(serializers.ModelSerializer):
    # İlişkili alanları daha okunabilir göstermek için (opsiyonel)
    # akademik_unvan = KadroTipiSerializer(read_only=True) # Nested serializer örneği
    # VEYA sadece ID ile işlem yapmak için:
    # akademik_unvan = serializers.PrimaryKeyRelatedField(queryset=KadroTipi.objects.all(), allow_null=True, required=False)

    class Meta:
        model = User
        # Admin listesinde ve detayında görmek isteyeceğiniz tüm alanları ekleyin
        fields = [
            'id', 'username', 'password', # Password write_only olacak
            'first_name', 'last_name', 'email',
            'TC_KIMLIK', 'user_type', 'telefon', 'adres',
            'akademik_unvan', # Foreign Key ID'si veya Nested Serializer
            'is_active', 'is_staff', 'is_superuser',
            'last_login', 'date_joined'
        ]
        # Sadece okunabilir alanlar (oluşturma/güncellemede dikkate alınmaz)
        read_only_fields = ['id', 'last_login', 'date_joined']

        # Alanlara özel ayarlar (örn: şifre sadece yazılabilir)
        extra_kwargs = {
            'password': {
                'write_only': True,       # Listelemede görünmez
                'required': True,         # Oluştururken zorunlu
                'style': {'input_type': 'password'} # API arayüzünde gizli gösterir
             },
             # TCKN oluşturulduktan sonra değiştirilemesin (isteğe bağlı)
             # 'TC_KIMLIK': {'read_only': True}, # Eğer AbstractUser kullanıyorsanız bu zaten unique
             # 'username': {'read_only': True} # Kullanıcı adı değiştirilemesin?
        }

    def create(self, validated_data):
        """ Yeni kullanıcı oluştururken parolayı hashler. """
        # `create_user` metodu AbstractUser ve AbstractBaseUser için vardır
        # ve parolayı otomatik hashler.
        user = User.objects.create_user(**validated_data)
        # Eğer akademik_unvan ID olarak geliyorsa ve set edilmesi gerekiyorsa:
        # unvan_id = validated_data.get('akademik_unvan')
        # if unvan_id:
        #     user.akademik_unvan_id = unvan_id
        # user.save() # create_user zaten kaydeder
        return user

    def update(self, instance, validated_data):
        """ Kullanıcı güncellenirken parola gelirse onu hashler. """
        # Parolayı ayrıca al ve validated_data'dan çıkar
        password = validated_data.pop('password', None)
        # Diğer alanları normal şekilde güncelle
        user = super().update(instance, validated_data)

        # Eğer yeni bir parola gönderildiyse, onu set et
        if password:
            user.set_password(password)
            user.save()

        return user