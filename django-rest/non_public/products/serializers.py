from rest_framework import serializers
from .models import products, products_clientproductassignment
from non_public.details_mycompany.serializers import CompanyListSerializer
from non_public.details_clients.serializers import ClientListSerializer

class ProductSerializer(serializers.ModelSerializer):
    company_details = CompanyListSerializer(source='company', read_only=True)
    
    class Meta:
        model = products
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class ProductListSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    
    class Meta:
        model = products
        fields = ['id', 'name', 'description', 'sku', 'price', 'company_name', 'is_active']

class ClientProductAssignmentSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    client_details = ClientListSerializer(source='client', read_only=True)
    
    class Meta:
        model = products_clientproductassignment
        fields = '__all__'
        read_only_fields = ('assigned_at',)

class ProductAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = products_clientproductassignment
        fields = ['client', 'product', 'is_active'] 