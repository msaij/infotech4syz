from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import delivery_challan
from .serializers import DeliveryChallanSerializer, DeliveryChallanListSerializer, DeliveryChallanStatusSerializer
from non_public.permissions import IsCompanyUser, IsManagerOrAdmin, IsDeliveryChallanOwner

# Create your views here.

class CompanyDeliveryChallanViewSet(viewsets.ModelViewSet):
    queryset = delivery_challan.objects.all()
    serializer_class = DeliveryChallanSerializer
    permission_classes = [IsCompanyUser, IsManagerOrAdmin]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['challan_number', 'client__name', 'dc_summary']
    ordering_fields = ['created_at', 'date', 'status']
    
    def get_queryset(self):
        # Company users can see all delivery challans for their company's clients
        return delivery_challan.objects.filter(client__company=self.request.user.profile.company)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return DeliveryChallanListSerializer
        return DeliveryChallanSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['patch'])
    def status(self, request, pk=None):
        challan = self.get_object()
        serializer = DeliveryChallanStatusSerializer(challan, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ClientDeliveryChallanViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = delivery_challan.objects.all()
    serializer_class = DeliveryChallanSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['challan_number', 'dc_summary']
    ordering_fields = ['created_at', 'date', 'status']
    
    def get_queryset(self):
        if hasattr(self.request.user, 'profile') and self.request.user.profile.user_type == 'client':
            return delivery_challan.objects.filter(client=self.request.user.profile.client)
        return delivery_challan.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return DeliveryChallanListSerializer
        return DeliveryChallanSerializer
    
    @action(detail=True, methods=['patch'])
    def status(self, request, pk=None):
        challan = self.get_object()
        # Client users can only update status to 'delivered' or 'cancelled'
        if request.data.get('status') not in ['delivered', 'cancelled']:
            return Response({'error': 'Invalid status for client users'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = DeliveryChallanStatusSerializer(challan, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
