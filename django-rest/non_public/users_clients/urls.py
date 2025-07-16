from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientUserViewSet

router = DefaultRouter()
router.register(r'', ClientUserViewSet, basename='clientuser')

urlpatterns = [
    path('', include(router.urls)),
] 