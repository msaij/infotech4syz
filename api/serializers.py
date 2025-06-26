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
    """Serializer for the User model, exposes basic user info for authentication and profile."""
    class Meta:
        model = get_user_model()
        fields = ['id', 'username', 'email']

class DeliveryChallanSerializer(serializers.ModelSerializer):
    """Serializer for DeliveryChallan model, used for serializing delivery challan data."""
    class Meta:
        model = DeliveryChallan
        fields = '__all__'
