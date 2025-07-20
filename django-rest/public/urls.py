from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContactUsViewSet

router = DefaultRouter()
router.register(r'contact', ContactUsViewSet, basename='contact')

urlpatterns = [
    path('', include(router.urls)),
] 