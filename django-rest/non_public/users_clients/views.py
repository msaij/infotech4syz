from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from non_public.users_mycompany.models import users_mycompany
from .serializers import ClientUserSerializer

class TestAuthView(APIView):
    """Simple test view to check authentication"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        print(f"TEST AUTH: User: {request.user.username}, ID: {request.user.id}")
        return Response({
            'message': 'Authentication working',
            'user': request.user.username,
            'user_id': request.user.id
        })

class ClientUserViewSet(viewsets.ModelViewSet):
    """ViewSet for client users - supports read and update operations"""
    serializer_class = ClientUserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Clients can only see their own user data from the users_mycompany model
        print(f"DEBUG: User: {self.request.user.username}, User ID: {self.request.user.id}")
        print(f"DEBUG: User is authenticated: {self.request.user.is_authenticated}")
        print(f"DEBUG: User has profile: {hasattr(self.request.user, 'profile')}")
        
        if hasattr(self.request.user, 'profile'):
            print(f"DEBUG: Profile user_type: {self.request.user.profile.user_type}")
            print(f"DEBUG: Profile role: {self.request.user.profile.role}")
        
        # Check all profiles for this user
        all_profiles = users_mycompany.objects.filter(user=self.request.user)
        print(f"DEBUG: All profiles for user: {list(all_profiles.values('id', 'user_type', 'role'))}")
        
        queryset = users_mycompany.objects.filter(
            user=self.request.user,
            user_type='client'
        )
        print(f"DEBUG: Filtered QuerySet count: {queryset.count()}")
        return queryset
    
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
    
    @action(detail=False, methods=['get'])
    def debug(self, request):
        """Debug endpoint to check authentication and user data"""
        return Response({
            'user_id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'is_authenticated': request.user.is_authenticated,
            'has_profile': hasattr(request.user, 'profile'),
            'profile_type': getattr(request.user.profile, 'user_type', None) if hasattr(request.user, 'profile') else None,
            'all_profiles': list(users_mycompany.objects.filter(user=request.user).values('id', 'user_type', 'role'))
        })
