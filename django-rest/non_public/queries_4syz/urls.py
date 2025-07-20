from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import Query4syzViewSet

router = DefaultRouter()
router.register(r'', Query4syzViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 