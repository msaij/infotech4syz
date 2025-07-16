from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientUserViewSet, TestAuthView

router = DefaultRouter()
router.register(r'', ClientUserViewSet, basename='clientuser')

urlpatterns = [
    path('test-auth/', TestAuthView.as_view(), name='test_auth'),
    path('', include(router.urls)),
] 