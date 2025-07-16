from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyProductViewSet

router = DefaultRouter()
router.register(r'', CompanyProductViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 