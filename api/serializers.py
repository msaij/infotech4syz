from rest_framework import serializers
from .models import ContactUs
from django.contrib.auth import get_user_model

class ContactUsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactUs
        fields = ['name', 'phone', 'email', 'city', 'zip', 'message']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id', 'username', 'email']
