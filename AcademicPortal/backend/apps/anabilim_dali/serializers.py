from rest_framework import serializers
from .models import AnabilimDali

class AnabilimDaliSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnabilimDali
        fields = ['id', 'ad', 'bolum']
        read_only_fields = ['id']