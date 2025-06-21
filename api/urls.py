from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    ContactUsCreateView,
    ForgotPasswordView,
    check_email,
    login_view,
    logout_view,
    csrf_token,
    UserViewSet,
)

app_name = "api"

urlpatterns = [
    path('contact/', ContactUsCreateView.as_view(), name='contact-us-create'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('check-email/', check_email, name='check-email'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('csrf/', csrf_token, name='csrf-token'),
]

router = DefaultRouter()
router.register('users', UserViewSet, basename='user')

urlpatterns += router.urls

