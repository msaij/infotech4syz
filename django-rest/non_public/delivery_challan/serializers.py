from rest_framework import serializers
from .models import delivery_challan
from non_public.details_clients.serializers import ClientListSerializer
from non_public.users_mycompany.serializers import UserSerializer

class DeliveryChallanSerializer(serializers.ModelSerializer):
    client_details = ClientListSerializer(source='client', read_only=True)
    created_by_details = UserSerializer(source='created_by', read_only=True)
    
    class Meta:
        model = delivery_challan
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'challan_number')

class DeliveryChallanListSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = delivery_challan
        fields = ['id', 'challan_number', 'date', 'client_name', 'dc_summary', 'delivery_executives', 
                 'invoice_number', 'invoice_date', 'invoice_submission', 'proof_of_delivery', 
                 'pod_upload_date', 'status', 'created_by_name', 'created_at', 'updated_at']

class DeliveryChallanStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = delivery_challan
        fields = ['status'] 