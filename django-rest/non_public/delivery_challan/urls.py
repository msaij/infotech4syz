from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyDeliveryChallanViewSet, ClientDeliveryChallanViewSet

company_router = DefaultRouter()
company_router.register(r'', CompanyDeliveryChallanViewSet)

client_router = DefaultRouter()
client_router.register(r'', ClientDeliveryChallanViewSet)

urlpatterns = [
    path('', include(company_router.urls)),
    path('', include(client_router.urls)),
] 