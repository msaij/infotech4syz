"""
URL configuration for backend project.

Defines the URL routes for the Django backend, including admin, API, and authentication endpoints.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),  # Django admin interface
    path('api/', include('api.urls')),  # Main API endpoints
    path('api-auth/', include('rest_framework.urls')),  # DRF login/logout views
    path('api/password-reset/', include('django.contrib.auth.urls')),  # Password reset endpoints
]
