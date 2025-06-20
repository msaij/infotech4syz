from django.urls import path
from .views import ContactUsCreateView, ForgotPasswordView, check_email, login_view

app_name = "api"

urlpatterns = [
    path('contact/', ContactUsCreateView.as_view(), name='contact-us-create'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('check-email/', check_email, name='check-email'),
    path('login/', login_view, name='login'),
]

