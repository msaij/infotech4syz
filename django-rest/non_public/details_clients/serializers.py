from rest_framework import serializers
from .models import details_clients
from non_public.details_mycompany.serializers import CompanyListSerializer

class ClientSerializer(serializers.ModelSerializer):
    company_details = CompanyListSerializer(source='company', read_only=True)
    
    class Meta:
        model = details_clients
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class ClientListSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    
    class Meta:
        model = details_clients
        fields = ['id', 'name', 'email_domain', 'short_name', 'company_name', 'phone', 'website', 'contact_person', 'is_active'] 