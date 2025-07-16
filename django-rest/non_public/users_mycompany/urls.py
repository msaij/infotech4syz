from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyUserViewSet, ClientUserViewSet

company_router = DefaultRouter()
company_router.register(r'', CompanyUserViewSet)

urlpatterns = [
    path('', include(company_router.urls)),
]

# For client user management - separate router
client_router = DefaultRouter()
client_router.register(r'', ClientUserViewSet)

client_user_urlpatterns = [
    path('', include(client_router.urls)),
] 