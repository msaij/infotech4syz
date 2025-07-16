"""
URL configuration for backend project.

Defines the URL routes for the Django backend, including admin, API, and authentication endpoints.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

def health_check(request):
    """Health check endpoint for service monitoring."""
    return JsonResponse({
        "status": "healthy",
        "service": "Django REST API",
        "version": "2.0.0",
        "database": "connected",
        "endpoints": {
            "admin": "/admin/",
            "token": "/api/token/",
            "token_refresh": "/api/token/refresh/",
            "health": "/api/v1/health/"
        }
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_details(request):
    """Get current user details"""
    try:
        profile = request.user.profile
        user_data = {
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'user_type': profile.user_type,
            'role': profile.role,
            'phone': profile.phone,
            'department': profile.department,
            'position': profile.position,
        }
        
        if profile.user_type == 'company' and profile.company:
            user_data['company'] = {
                'id': profile.company.id,
                'name': profile.company.name,
                'email_domain': profile.company.email_domain,
            }
        elif profile.user_type == 'client' and profile.client:
            user_data['client'] = {
                'id': profile.client.id,
                'name': profile.client.name,
            }
        
        return Response(user_data)
    except Exception as e:
        return Response({'error': str(e)}, status=400)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/health/', health_check, name='health_check'),
    path('api/v1/user/me/', user_details, name='user_details'),
    path('api/v1/public/', include('public.urls')),
    
    # Company endpoints - only accessible by company users
    path('api/v1/company/', include('non_public.company_urls')),
    
    # Client endpoints - only accessible by client users
    path('api/v1/client/', include('non_public.client_urls')),
]
