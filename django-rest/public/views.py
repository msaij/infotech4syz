from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import contact_us
from .serializers import ContactUsSerializer

# Create your views here.

class ContactUsViewSet(viewsets.ModelViewSet):
    queryset = contact_us.objects.all()
    serializer_class = ContactUsSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        return contact_us.objects.none()  # No listing for public
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
