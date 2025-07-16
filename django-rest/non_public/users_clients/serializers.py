from rest_framework import serializers
from django.contrib.auth.models import User
from non_public.users_mycompany.models import users_mycompany

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active']
        read_only_fields = ('id',)

class ClientUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    user_type = serializers.CharField(read_only=True)
    role = serializers.CharField(read_only=True)
    client_name = serializers.CharField(source='client.name', read_only=True)
    client_short_name = serializers.CharField(source='client.short_name', read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = users_mycompany
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'user_type', 'role', 'client_name', 'client_short_name', 'phone', 'department', 'position', 'created_at', 'updated_at', 'user']
        read_only_fields = ['id', 'created_at', 'updated_at', 'user_type', 'role', 'client_name', 'client_short_name'] 