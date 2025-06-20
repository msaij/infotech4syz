from rest_framework import serializers
from .models import ContactUs

class ContactUsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactUs
        fields = ['id', 'name', 'phone', 'email', 'city', 'zip', 'message', 'created_at']
