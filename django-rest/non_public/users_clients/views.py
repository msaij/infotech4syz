from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from non_public.users_mycompany.models import users_mycompany
from .serializers import ClientUserSerializer

class ClientUserViewSet(viewsets.ModelViewSet):
    """ViewSet for client users - supports read and update operations"""
    serializer_class = ClientUserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Clients can only see their own user data from the users_mycompany model
        return users_mycompany.objects.filter(
            user=self.request.user,
            user_type='client'
        )
    
    def update(self, request, *args, **kwargs):
        """Override update to handle nested user data"""
        instance = self.get_object()
        
        # Handle nested user data
        user_data = request.data.get('user', {})
        if user_data:
            user = instance.user
            if 'first_name' in user_data:
                user.first_name = user_data['first_name']
            if 'last_name' in user_data:
                user.last_name = user_data['last_name']
            if 'email' in user_data:
                user.email = user_data['email']
            if 'username' in user_data:
                user.username = user_data['username']
            user.save()
        
        # Update profile fields
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)
