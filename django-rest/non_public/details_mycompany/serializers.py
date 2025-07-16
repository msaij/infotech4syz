from rest_framework import serializers
from .models import details_mycompany

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = details_mycompany
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class CompanyListSerializer(serializers.ModelSerializer):
    class Meta:
        model = details_mycompany
        fields = ['id', 'name', 'email_domain', 'short_name', 'phone', 'website', 'is_active'] 