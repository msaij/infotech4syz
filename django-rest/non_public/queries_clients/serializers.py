from rest_framework import serializers
from .models import queries_clients

class ClientQuerySerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = queries_clients
        fields = ['id', 'user', 'username', 'subject', 'message', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at'] 