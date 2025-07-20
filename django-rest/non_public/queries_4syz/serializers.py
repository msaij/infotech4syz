from rest_framework import serializers
from .models import Query4syz
from non_public.users_foursyz.serializers import UserFoursyzSerializer


class Query4syzSerializer(serializers.ModelSerializer):
    raised_by = UserFoursyzSerializer(read_only=True)
    assigned_to = UserFoursyzSerializer(read_only=True)
    
    class Meta:
        model = Query4syz
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'resolved_at']


class Query4syzCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Query4syz
        fields = ['title', 'description', 'priority', 'category']
    
    def create(self, validated_data):
        # Set the raised_by to the current user
        validated_data['raised_by'] = self.context['request'].user.foursyz_profile
        return super().create(validated_data) 