from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import details_clients
from .serializers import ClientSerializer, ClientListSerializer
from non_public.permissions import IsCompanyUser, IsManagerOrAdmin, IsClientUser

# Create your views here.

class ClientViewSet(viewsets.ModelViewSet):
    queryset = details_clients.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [IsCompanyUser, IsManagerOrAdmin]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'email_domain', 'short_name', 'contact_person']
    ordering_fields = ['name', 'created_at']
    
    def get_queryset(self):
        return details_clients.objects.filter(is_active=True)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ClientListSerializer
        return ClientSerializer
    
    def perform_create(self, serializer):
        serializer.save()

class ClientDetailViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = details_clients.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'email_domain', 'short_name']
    ordering_fields = ['name', 'created_at']
    
    def get_queryset(self):
        if hasattr(self.request.user, 'profile'):
            if self.request.user.profile.user_type == 'company':
                return details_clients.objects.filter(is_active=True)
            elif self.request.user.profile.user_type == 'client':
                return details_clients.objects.filter(id=self.request.user.profile.client.id, is_active=True)
        return details_clients.objects.none()

class ClientProfileViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for client users to access their own profile"""
    serializer_class = ClientSerializer
    permission_classes = [IsClientUser]
    
    def get_queryset(self):
        if hasattr(self.request.user, 'profile') and self.request.user.profile.user_type == 'client':
            return details_clients.objects.filter(id=self.request.user.profile.client.id, is_active=True)
        return details_clients.objects.none()
    
    @action(detail=False, methods=['get'])
    def profile(self, request):
        """Get current client's profile"""
        if hasattr(request.user, 'profile') and request.user.profile.user_type == 'client':
            client = request.user.profile.client
            serializer = self.get_serializer(client)
            return Response(serializer.data)
        return Response({'detail': 'Client profile not found'}, status=status.HTTP_404_NOT_FOUND)
