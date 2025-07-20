from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserClientViewSet

router = DefaultRouter()
router.register(r'', UserClientViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 