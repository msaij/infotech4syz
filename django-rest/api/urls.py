from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    ContactUsCreateView,
    ForgotPasswordView,
    check_username,  # changed from check_email
    logout_view,
    csrf_token,
    UserViewSet,
    session_login,
    session_logout,
)

app_name = "api"

urlpatterns = [
    path('contact/', ContactUsCreateView.as_view(), name='contact-us-create'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('check-username/', check_username, name='check-username'),  # changed
    path('logout/', logout_view, name='logout'),
    path('csrf/', csrf_token, name='csrf-token'),
    path('session-login/', session_login, name='session-login'),
    path('session-logout/', session_logout, name='session-logout'),
]

router = DefaultRouter()
router.register('users', UserViewSet, basename='user')

urlpatterns += router.urls

