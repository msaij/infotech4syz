from rest_framework import serializers
from .models import QueryClient
from non_public.users_clients.serializers import UserClientSerializer
from non_public.users_foursyz.serializers import UserFoursyzSerializer


class QueryClientSerializer(serializers.ModelSerializer):
    raised_by = UserClientSerializer(read_only=True)
    assigned_to = UserFoursyzSerializer(read_only=True)
    
    class Meta:
        model = QueryClient
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'resolved_at']


class QueryClientCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = QueryClient
        fields = ['title', 'description', 'priority', 'category']
    
    def create(self, validated_data):
        # Set the raised_by to the current user's client profile
        validated_data['raised_by'] = self.context['request'].user.client_profile
        return super().create(validated_data) 