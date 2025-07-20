from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserFoursyzViewSet

router = DefaultRouter()
router.register(r'', UserFoursyzViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 