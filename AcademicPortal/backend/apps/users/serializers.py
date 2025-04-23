from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'email',
            'TC_KIMLIK', 'user_type', 'telefon', 'adres', 'akademik_unvan'
        ]
        read_only_fields = ['id']