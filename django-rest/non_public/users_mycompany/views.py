from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import users_mycompany
from .serializers import UserProfileSerializer, UserProfileCreateSerializer, UserProfileListSerializer
from non_public.permissions import IsCompanyUser, IsManagerOrAdmin

# Create your views here.

class CompanyUserViewSet(viewsets.ModelViewSet):
    queryset = users_mycompany.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsCompanyUser, IsManagerOrAdmin]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name', 'department']
    ordering_fields = ['user__username', 'created_at']
    
    def get_queryset(self):
        return users_mycompany.objects.filter(
            user_type='company',
            company=self.request.user.profile.company,
            is_active=True
        )
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserProfileCreateSerializer
        elif self.action == 'list':
            return UserProfileListSerializer
        return UserProfileSerializer
    
    def perform_create(self, serializer):
        serializer.save(user_type='company', company=self.request.user.profile.company)

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

class ClientUserViewSet(viewsets.ModelViewSet):
    queryset = users_mycompany.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name', 'department']
    ordering_fields = ['user__username', 'created_at']
    
    def get_queryset(self):
        if hasattr(self.request.user, 'profile'):
            if self.request.user.profile.user_type == 'company':
                return users_mycompany.objects.filter(
                    user_type='client',
                    is_active=True
                )
            elif self.request.user.profile.user_type == 'client':
                return users_mycompany.objects.filter(
                    user_type='client',
                    client=self.request.user.profile.client,
                    is_active=True
                )
        return users_mycompany.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserProfileCreateSerializer
        elif self.action == 'list':
            return UserProfileListSerializer
        return UserProfileSerializer
    
    def perform_create(self, serializer):
        if self.request.user.profile.user_type == 'company':
            # Company user creating client user
            client_id = self.request.data.get('client')
            from non_public.details_clients.models import Client
            client = Client.objects.get(id=client_id)
            serializer.save(user_type='client', client=client)
        else:
            # Client user creating another client user
            serializer.save(user_type='client', client=self.request.user.profile.client)
