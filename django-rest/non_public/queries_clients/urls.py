from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QueryClientViewSet

router = DefaultRouter()
router.register(r'', QueryClientViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 