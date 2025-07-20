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
    return JsonResponse({
        "status": "healthy",
        "service": "Django REST API",
        "version": "2.0.0",
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_details(request):
    user = request.user
    
    # Check if user is a 4syz user
    try:
        foursyz_profile = user.foursyz_profile
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'user_type': 'foursyz',
            'role': foursyz_profile.role,
            'company_name': foursyz_profile.foursyz.name,
            'department': foursyz_profile.department,
            'position': foursyz_profile.position,
            'phone': foursyz_profile.phone,
            'is_active': foursyz_profile.is_active,
        })
    except:
        pass
    
    # Check if user is a client user
    try:
        client_profile = user.client_profile
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'user_type': 'client',
            'role': client_profile.role,
            'company_name': client_profile.client.name,
            'department': client_profile.department,
            'position': client_profile.position,
            'phone': client_profile.phone,
            'is_active': client_profile.is_active,
        })
    except:
        pass
    
    # User doesn't exist in either table
    return Response({
        'error': 'You are not part of this system. Please contact your administrator.'
    }, status=403)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/health/', health_check, name='health_check'),
    path('api/v1/user/me/', user_details, name='user_details'),
    path('api/v1/public/', include('public.urls')),
    path('api/v1/foursyz/', include('non_public.foursyz.urls')),
    path('api/v1/users-foursyz/', include('non_public.users_foursyz.urls')),
    path('api/v1/clients/', include('non_public.clients.urls')),
    path('api/v1/users-clients/', include('non_public.users_clients.urls')),
    path('api/v1/queries-4syz/', include('non_public.queries_4syz.urls')),
    path('api/v1/queries-clients/', include('non_public.queries_clients.urls')),
    path('api/v1/rbac/', include('non_public.rbac.urls')),
]
