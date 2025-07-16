from rest_framework import serializers
from .models import queries_mycompany
from non_public.details_mycompany.serializers import CompanyListSerializer
from non_public.details_clients.serializers import ClientListSerializer
from non_public.users_mycompany.serializers import UserSerializer

class QuerySerializer(serializers.ModelSerializer):
    company_details = CompanyListSerializer(source='company', read_only=True)
    client_details = ClientListSerializer(source='client', read_only=True)
    created_by_details = UserSerializer(source='created_by', read_only=True)
    assigned_to_details = UserSerializer(source='assigned_to', read_only=True)
    
    class Meta:
        model = queries_mycompany
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class QueryListSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    client_name = serializers.CharField(source='client.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    
    class Meta:
        model = queries_mycompany
        fields = ['id', 'title', 'query_type', 'status', 'priority', 'company_name', 'client_name', 'created_by_name', 'assigned_to_name', 'created_at'] 