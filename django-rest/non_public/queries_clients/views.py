from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import queries_clients
from .serializers import ClientQuerySerializer
from non_public.permissions import IsClientUser

# Create your views here.

class ClientQueryViewSet(viewsets.ModelViewSet):
    """ViewSet for client queries"""
    serializer_class = ClientQuerySerializer
    permission_classes = [IsAuthenticated, IsClientUser]
    
    def get_queryset(self):
        # Clients can only see their own queries
        return queries_clients.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
