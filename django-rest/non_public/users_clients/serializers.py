from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserClient
from non_public.clients.serializers import ClientSerializer


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active']


class UserClientSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    client = ClientSerializer(read_only=True)
    
    class Meta:
        model = UserClient
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class UserClientCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = UserClient
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role', 'department', 'position', 'phone', 'client']
    
    def create(self, validated_data):
        user_data = {
            'username': validated_data.pop('username'),
            'email': validated_data.pop('email'),
            'password': validated_data.pop('password'),
            'first_name': validated_data.pop('first_name', ''),
            'last_name': validated_data.pop('last_name', ''),
        }
        
        user = User.objects.create_user(**user_data)
        validated_data['user'] = user
        
        return super().create(validated_data) 