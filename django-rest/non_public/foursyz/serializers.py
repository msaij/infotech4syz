from rest_framework import serializers
from .models import Foursyz


class FoursyzSerializer(serializers.ModelSerializer):
    class Meta:
        model = Foursyz
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class FoursyzDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Foursyz
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at'] 