from rest_framework import serializers
from .models import ContactUs
from django.contrib.auth import get_user_model
from .models.deliverychallan import DeliveryChallan

class ContactUsSerializer(serializers.ModelSerializer):
    """Serializer for ContactUs model, used for validating and serializing contact form data."""
    class Meta:
        model = ContactUs
        fields = ['name', 'phone', 'email', 'city', 'zip', 'message']
        # Only expose relevant fields for the contact form

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model, used for user profile endpoints."""
    class Meta:
        model = get_user_model()
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class DeliveryChallanSerializer(serializers.ModelSerializer):
    proof_of_delivery = serializers.FileField(required=False, allow_null=True)
    pod_upload_date = serializers.DateTimeField(read_only=True)
    class Meta:
        model = DeliveryChallan
        fields = [
            'id', 'challan_number', 'date', 'customer', 'dc_summary',
            'delivery_executives', 'invoice_number', 'invoice_date',
            'invoice_submission', 'proof_of_delivery', 'pod_upload_date',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'challan_number', 'created_at', 'updated_at', 'pod_upload_date']
