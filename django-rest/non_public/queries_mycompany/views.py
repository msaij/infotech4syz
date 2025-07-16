from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import queries_mycompany
from .serializers import QuerySerializer, QueryListSerializer
from non_public.permissions import IsCompanyUser, IsManagerOrAdmin

# Create your views here.

class CompanyQueryViewSet(viewsets.ModelViewSet):
    queryset = queries_mycompany.objects.all()
    serializer_class = QuerySerializer
    permission_classes = [IsCompanyUser, IsManagerOrAdmin]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['title', 'description', 'status']
    ordering_fields = ['created_at', 'priority', 'status']
    
    def get_queryset(self):
        return queries_mycompany.objects.filter(
            query_type='company',
            company=self.request.user.profile.company
        )
    
    def get_serializer_class(self):
        if self.action == 'list':
            return QueryListSerializer
        return QuerySerializer
    
    def perform_create(self, serializer):
        serializer.save(
            query_type='company',
            company=self.request.user.profile.company,
            created_by=self.request.user
        )

class ClientQueryViewSet(viewsets.ModelViewSet):
    queryset = queries_mycompany.objects.all()
    serializer_class = QuerySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['title', 'description', 'status']
    ordering_fields = ['created_at', 'priority', 'status']
    
    def get_queryset(self):
        if hasattr(self.request.user, 'profile'):
            if self.request.user.profile.user_type == 'company':
                return queries_mycompany.objects.filter(
                    query_type='client'
                )
            elif self.request.user.profile.user_type == 'client':
                return queries_mycompany.objects.filter(
                    query_type='client',
                    client=self.request.user.profile.client
                )
        return queries_mycompany.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return QueryListSerializer
        return QuerySerializer
    
    def perform_create(self, serializer):
        if self.request.user.profile.user_type == 'company':
            # Company user creating client query
            client_id = self.request.data.get('client')
            from non_public.details_clients.models import Client
            client = Client.objects.get(id=client_id)
            serializer.save(
                query_type='client',
                client=client,
                created_by=self.request.user
            )
        else:
            # Client user creating their own query
            serializer.save(
                query_type='client',
                client=self.request.user.profile.client,
                created_by=self.request.user
            )
