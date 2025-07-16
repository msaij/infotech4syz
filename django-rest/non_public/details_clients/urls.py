from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientViewSet, ClientDetailViewSet, ClientProfileViewSet

# Router for company users to manage clients
company_router = DefaultRouter()
company_router.register(r'details', ClientViewSet)

# Router for client users to access their own profile
client_router = DefaultRouter()
client_router.register(r'profile', ClientProfileViewSet, basename='client-profile')

# Combined URL patterns for both company and client access
urlpatterns = [
    # Company client management endpoints
    path('', include(company_router.urls)),
    # Client profile endpoints
    path('', include(client_router.urls)),
] 