from rest_framework import serializers
from .models import delivery_challan
from non_public.details_mycompany.serializers import CompanyListSerializer
from non_public.details_clients.serializers import ClientListSerializer
from non_public.users_mycompany.serializers import UserSerializer

class DeliveryChallanSerializer(serializers.ModelSerializer):
    company_details = CompanyListSerializer(source='company', read_only=True)
    client_details = ClientListSerializer(source='client', read_only=True)
    created_by_details = UserSerializer(source='created_by', read_only=True)
    
    class Meta:
        model = delivery_challan
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'total_price')

class DeliveryChallanListSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    client_name = serializers.CharField(source='client.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = delivery_challan
        fields = ['id', 'challan_number', 'company_name', 'client_name', 'product_name', 'quantity', 'total_price', 'delivery_date', 'status', 'created_by_name', 'created_at']

class DeliveryChallanStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = delivery_challan
        fields = ['status'] 