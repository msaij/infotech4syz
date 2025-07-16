from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import details_mycompany
from .serializers import CompanySerializer, CompanyListSerializer
from non_public.permissions import IsCompanyUser, IsCompanyAdmin

# Create your views here.

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = details_mycompany.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsCompanyUser, IsCompanyAdmin]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'email_domain', 'short_name']
    ordering_fields = ['name', 'created_at']
    
    def get_queryset(self):
        return details_mycompany.objects.filter(is_active=True)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CompanyListSerializer
        return CompanySerializer
