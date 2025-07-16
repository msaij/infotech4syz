from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientQueryViewSet

router = DefaultRouter()
router.register(r'', ClientQueryViewSet, basename='clientquery')

urlpatterns = [
    path('', include(router.urls)),
] 