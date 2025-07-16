from rest_framework import serializers
from django.contrib.auth.models import User
from .models import users_mycompany
from non_public.details_mycompany.serializers import CompanyListSerializer
from non_public.details_clients.serializers import ClientListSerializer

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active']
        read_only_fields = ('id',)

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    company_details = CompanyListSerializer(source='company', read_only=True)
    client_details = ClientListSerializer(source='client', read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_short_name = serializers.CharField(source='company.short_name', read_only=True)
    client_name = serializers.CharField(source='client.name', read_only=True)
    client_short_name = serializers.CharField(source='client.short_name', read_only=True)
    
    class Meta:
        model = users_mycompany
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class UserProfileCreateSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    
    class Meta:
        model = users_mycompany
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
    
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create_user(**user_data)
        profile = users_mycompany.objects.create(user=user, **validated_data)
        return profile

class UserProfileListSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_short_name = serializers.CharField(source='company.short_name', read_only=True)
    client_name = serializers.CharField(source='client.name', read_only=True)
    client_short_name = serializers.CharField(source='client.short_name', read_only=True)
    
    class Meta:
        model = users_mycompany
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'user_type', 'role', 'company_name', 'company_short_name', 'client_name', 'client_short_name', 'phone', 'department', 'position', 'is_active'] 