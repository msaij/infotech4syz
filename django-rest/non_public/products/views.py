from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import products, products_clientproductassignment
from .serializers import ProductSerializer, ProductListSerializer, ClientProductAssignmentSerializer, ProductAssignmentSerializer
from non_public.permissions import IsCompanyUser, IsManagerOrAdmin

class CompanyProductViewSet(viewsets.ModelViewSet):
    queryset = products.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsCompanyUser, IsManagerOrAdmin]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'sku', 'description']
    ordering_fields = ['name', 'price', 'created_at']
    
    def get_queryset(self):
        return products.objects.filter(company=self.request.user.profile.company, is_active=True)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductSerializer
    
    def perform_create(self, serializer):
        serializer.save(company=self.request.user.profile.company)
    
    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        product = self.get_object()
        client_id = request.data.get('client_id')
        
        try:
            from non_public.details_clients.models import Client
            client = Client.objects.get(id=client_id)
            
            assignment, created = ClientProductAssignment.objects.get_or_create(
                client=client,
                product=product,
                defaults={'assigned_by': request.user}
            )
            
            if not created:
                assignment.is_active = True
                assignment.save()
            
            return Response({'message': 'Product assigned successfully'}, status=status.HTTP_200_OK)
        except Client.DoesNotExist:
            return Response({'error': 'Client not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def assignments(self, request):
        assignments = ClientProductAssignment.objects.filter(
            product__company=self.request.user.profile.company,
            is_active=True
        )
        serializer = ClientProductAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)

class ClientProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = products.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'sku', 'description']
    ordering_fields = ['name', 'price', 'created_at']
    
    def get_queryset(self):
        if hasattr(self.request.user, 'profile') and self.request.user.profile.user_type == 'client':
            client = self.request.user.profile.client
            assigned_products = products_clientproductassignment.objects.filter(
                client=client, 
                is_active=True
            ).values_list('product_id', flat=True)
            return products.objects.filter(id__in=assigned_products, is_active=True)
        return products.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductSerializer
