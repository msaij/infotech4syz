from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyQueryViewSet, ClientQueryViewSet

company_router = DefaultRouter()
company_router.register(r'', CompanyQueryViewSet)

urlpatterns = [
    path('', include(company_router.urls)),
]

# For client query management - separate router
client_router = DefaultRouter()
client_router.register(r'', ClientQueryViewSet)

client_query_urlpatterns = [
    path('', include(client_router.urls)),
] 