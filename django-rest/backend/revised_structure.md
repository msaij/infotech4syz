# Revised Django Backend Structure

## Overview
This document outlines the revised Django backend structure addressing the feedback:
- Remove DeliveryChallanItem table
- Product visibility based on user type and assignments
- API paths: `/api/v1/company/*`, `/api/v1/client/*`, `/api/v1/public/*`
- User roles and access control
- Same tables accessible by different user types with proper filtering

## App Structure

### Public Apps
```
public/
├── __init__.py
├── apps.py
├── models.py
├── serializers.py
├── views.py
├── urls.py
└── tests.py
```

### Non-Public Apps
```
non_public/
├── details_mycompany/
├── details_clients/
├── users_mycompany/
├── users_clients/
├── queries_mycompany/
├── queries_clients/
├── delivery_challan/
└── products/
```

## Model Relationships

### Core Models

#### 1. User (Django Built-in)
```python
# Enhanced with custom fields
class User(AbstractUser):
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### 2. Company (details_mycompany)
```python
class Company(models.Model):
    name = models.CharField(max_length=255)
    email_domain = models.CharField(max_length=100, unique=True)  # e.g., "4syz.com"
    short_name = models.CharField(max_length=50, unique=True)     # e.g., "4syz"
    address = models.TextField()
    phone = models.CharField(max_length=20)
    website = models.URLField(blank=True)
    logo = models.ImageField(upload_to='company_logos/', blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Companies"
```

#### 3. Client (details_clients)
```python
class Client(models.Model):
    name = models.CharField(max_length=255)
    email_domain = models.CharField(max_length=100, unique=True)  # e.g., "linkedin.com"
    short_name = models.CharField(max_length=50, unique=True)     # e.g., "linkedin"
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='clients')
    address = models.TextField()
    phone = models.CharField(max_length=20)
    website = models.URLField(blank=True)
    contact_person = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### 4. UserProfile (users_mycompany & users_clients)
```python
class UserProfile(models.Model):
    USER_TYPE_CHOICES = [
        ('company', 'Company User'),
        ('client', 'Client User'),
    ]
    
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('manager', 'Manager'),
        ('user', 'Regular User'),
        ('viewer', 'Viewer'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    
    # For company users
    company = models.ForeignKey(Company, on_delete=models.CASCADE, null=True, blank=True, related_name='users')
    
    # For client users
    client = models.ForeignKey(Client, on_delete=models.CASCADE, null=True, blank=True, related_name='users')
    
    phone = models.CharField(max_length=20, blank=True)
    department = models.CharField(max_length=100, blank=True)
    position = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(user_type='company', company__isnull=False) | 
                      models.Q(user_type='client', client__isnull=False),
                name='valid_user_profile'
            )
        ]
```

#### 5. Product (products)
```python
class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    sku = models.CharField(max_length=100, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='products')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### 6. ClientProductAssignment (products)
```python
class ClientProductAssignment(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='product_assignments')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='client_assignments')
    is_active = models.BooleanField(default=True)
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='product_assignments_made')
    
    class Meta:
        unique_together = ['client', 'product']
```

#### 7. DeliveryChallan (delivery_challan)
```python
class DeliveryChallan(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    challan_number = models.CharField(max_length=50, unique=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='delivery_challans')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='delivery_challans')
    
    # Product details (no separate item table)
    product_name = models.CharField(max_length=255)
    product_sku = models.CharField(max_length=100)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    delivery_address = models.TextField()
    delivery_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_challans')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### 8. Query (queries_mycompany & queries_clients)
```python
class Query(models.Model):
    QUERY_TYPE_CHOICES = [
        ('company', 'Company Query'),
        ('client', 'Client Query'),
    ]
    
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    query_type = models.CharField(max_length=10, choices=QUERY_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    priority = models.CharField(max_length=20, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ], default='medium')
    
    # For company queries
    company = models.ForeignKey(Company, on_delete=models.CASCADE, null=True, blank=True, related_name='queries')
    
    # For client queries
    client = models.ForeignKey(Client, on_delete=models.CASCADE, null=True, blank=True, related_name='queries')
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_queries')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_queries')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Queries"
        constraints = [
            models.CheckConstraint(
                check=models.Q(query_type='company', company__isnull=False) | 
                      models.Q(query_type='client', client__isnull=False),
                name='valid_query'
            )
        ]
```

#### 9. ContactUs (public)
```python
class ContactUs(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    subject = models.CharField(max_length=255)
    message = models.TextField()
    phone = models.CharField(max_length=20, blank=True)
    company_name = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
```

## API Structure

### URLs Configuration
```python
# backend/urls.py
from django.urls import path, include

urlpatterns = [
    path('api/v1/public/', include('public.urls')),
    path('api/v1/company/', include('non_public.company_urls')),
    path('api/v1/client/', include('non_public.client_urls')),
]
```

### Company API Endpoints (non_public/company_urls.py)
```python
from django.urls import path, include

urlpatterns = [
    path('details/', include('non_public.details_mycompany.urls')),
    path('users/', include('non_public.users_mycompany.urls')),
    path('queries/', include('non_public.queries_mycompany.urls')),
    path('delivery-challan/', include('non_public.delivery_challan.company_urls')),
    path('products/', include('non_public.products.company_urls')),
    path('clients/', include('non_public.details_clients.urls')),
]
```

### Client API Endpoints (non_public/client_urls.py)
```python
from django.urls import path, include

urlpatterns = [
    path('details/', include('non_public.details_clients.client_urls')),
    path('users/', include('non_public.users_clients.urls')),
    path('queries/', include('non_public.queries_clients.urls')),
    path('delivery-challan/', include('non_public.delivery_challan.client_urls')),
    path('products/', include('non_public.products.client_urls')),
]
```

### Example API Endpoints

#### Company Management (Company Users Only)
- `GET /api/v1/company/details/` - List companies (admin only)
- `POST /api/v1/company/details/` - Create company (admin only)
- `GET /api/v1/company/details/{id}/` - Get company details
- `PUT /api/v1/company/details/{id}/` - Update company (admin only)
- `DELETE /api/v1/company/details/{id}/` - Delete company (admin only)

#### Client Management (Company Users Only)
- `GET /api/v1/company/clients/` - List clients
- `POST /api/v1/company/clients/` - Create client
- `GET /api/v1/company/clients/{id}/` - Get client details
- `PUT /api/v1/company/clients/{id}/` - Update client
- `DELETE /api/v1/company/clients/{id}/` - Delete client

#### Delivery Challan (Both Company and Client Users)
**Company API:**
- `GET /api/v1/company/delivery-challan/` - List all delivery challans
- `POST /api/v1/company/delivery-challan/` - Create delivery challan
- `GET /api/v1/company/delivery-challan/{id}/` - Get delivery challan details
- `PUT /api/v1/company/delivery-challan/{id}/` - Update delivery challan
- `PATCH /api/v1/company/delivery-challan/{id}/status/` - Update status

**Client API:**
- `GET /api/v1/client/delivery-challan/` - List client's delivery challans only
- `GET /api/v1/client/delivery-challan/{id}/` - Get client's delivery challan details
- `PATCH /api/v1/client/delivery-challan/{id}/status/` - Update status (limited)

#### Products (Both Company and Client Users)
**Company API:**
- `GET /api/v1/company/products/` - List all products
- `POST /api/v1/company/products/` - Create product
- `GET /api/v1/company/products/{id}/` - Get product details
- `PUT /api/v1/company/products/{id}/` - Update product
- `DELETE /api/v1/company/products/{id}/` - Delete product
- `POST /api/v1/company/products/{id}/assign/{client_id}/` - Assign product to client

**Client API:**
- `GET /api/v1/client/products/` - List assigned products only
- `GET /api/v1/client/products/{id}/` - Get assigned product details

#### User Management
**Company API:**
- `GET /api/v1/company/users/` - List company users
- `POST /api/v1/company/users/` - Create company user
- `GET /api/v1/company/users/{id}/` - Get company user details
- `PUT /api/v1/company/users/{id}/` - Update company user
- `DELETE /api/v1/company/users/{id}/` - Delete company user

**Client API:**
- `GET /api/v1/client/users/` - List client users
- `POST /api/v1/client/users/` - Create client user
- `GET /api/v1/client/users/{id}/` - Get client user details
- `PUT /api/v1/client/users/{id}/` - Update client user
- `DELETE /api/v1/client/users/{id}/` - Delete client user

#### Queries
**Company API:**
- `GET /api/v1/company/queries/` - List company queries
- `POST /api/v1/company/queries/` - Create company query
- `GET /api/v1/company/queries/{id}/` - Get company query details
- `PUT /api/v1/company/queries/{id}/` - Update company query

**Client API:**
- `GET /api/v1/client/queries/` - List client queries
- `POST /api/v1/client/queries/` - Create client query
- `GET /api/v1/client/queries/{id}/` - Get client query details
- `PUT /api/v1/client/queries/{id}/` - Update client query

#### Public
- `POST /api/v1/public/contact/` - Submit contact form

## User Roles and Permissions

### Role Definitions
```python
# permissions.py
from rest_framework import permissions

class IsCompanyUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                hasattr(request.user, 'profile') and 
                request.user.profile.user_type == 'company')

class IsClientUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                hasattr(request.user, 'profile') and 
                request.user.profile.user_type == 'client')

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                hasattr(request.user, 'profile') and 
                request.user.profile.role == 'admin')

class IsManagerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                hasattr(request.user, 'profile') and 
                request.user.profile.role in ['admin', 'manager'])

class IsCompanyOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.profile.company == obj.company

class IsClientOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.profile.client == obj.client
```

### ViewSet Examples

#### DeliveryChallan ViewSet (Company)
```python
# non_public/delivery_challan/views.py
from rest_framework import viewsets, permissions
from rest_framework.filters import SearchFilter, OrderingFilter

class CompanyDeliveryChallanViewSet(viewsets.ModelViewSet):
    serializer_class = DeliveryChallanSerializer
    permission_classes = [IsCompanyUser]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['challan_number', 'client__name', 'product_name']
    ordering_fields = ['created_at', 'delivery_date', 'status']
    
    def get_queryset(self):
        # Company users can see all delivery challans
        return DeliveryChallan.objects.filter(company=self.request.user.profile.company)
    
    def perform_create(self, serializer):
        serializer.save(
            company=self.request.user.profile.company,
            created_by=self.request.user
        )
```

#### DeliveryChallan ViewSet (Client)
```python
class ClientDeliveryChallanViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = DeliveryChallanSerializer
    permission_classes = [IsClientUser]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['challan_number', 'product_name']
    ordering_fields = ['created_at', 'delivery_date', 'status']
    
    def get_queryset(self):
        # Client users can only see their own delivery challans
        return DeliveryChallan.objects.filter(client=self.request.user.profile.client)
```

#### Product ViewSet (Client)
```python
# non_public/products/views.py
class ClientProductViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsClientUser]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'sku', 'description']
    ordering_fields = ['name', 'price', 'created_at']
    
    def get_queryset(self):
        # Client users can only see assigned products
        client = self.request.user.profile.client
        assigned_products = ClientProductAssignment.objects.filter(
            client=client, 
            is_active=True
        ).values_list('product_id', flat=True)
        return Product.objects.filter(id__in=assigned_products, is_active=True)
```

## Email Domain Validation

### Custom Validators
```python
# utils/validators.py
from django.core.exceptions import ValidationError
from django.core.validators import EmailValidator

def validate_email_domain(email, expected_domain):
    """Validate that email domain matches expected domain"""
    email_validator = EmailValidator()
    email_validator(email)
    
    domain = email.split('@')[1].lower()
    expected_domain = expected_domain.lower()
    
    if domain != expected_domain:
        raise ValidationError(f'Email domain must be {expected_domain}')

def validate_company_email_domain(email, company):
    """Validate email domain for company users"""
    validate_email_domain(email, company.email_domain)

def validate_client_email_domain(email, client):
    """Validate email domain for client users"""
    validate_email_domain(email, client.email_domain)
```

## Benefits of This Revised Structure

1. **Simplified Data Model**: Removed DeliveryChallanItem table
2. **Product Visibility Control**: Products are assigned to clients and only visible to assigned clients
3. **Clear API Structure**: `/api/v1/company/*`, `/api/v1/client/*`, `/api/v1/public/*`
4. **Role-Based Access**: Admin, Manager, User, Viewer roles with proper permissions
5. **Same Table, Different Access**: Delivery challan table accessible by both company and client users with proper filtering
6. **Email Domain Security**: Users can only be added with matching email domains
7. **Scalable**: Easy to extend with new features and roles

## Migration Strategy

1. Create new apps structure
2. Define new models with relationships
3. Create data migration scripts
4. Update API endpoints with proper routing
5. Implement role-based permissions
6. Test thoroughly
7. Deploy gradually

Would you like me to proceed with implementing this revised structure? 