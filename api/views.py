from django.shortcuts import render
from rest_framework import generics
from .models import ContactUs
from .serializers import ContactUsSerializer
from django.contrib.auth.models import User
from rest_framework import permissions
from rest_framework import serializers
from django.core.mail import send_mail
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view
from django.db import connection
from django.contrib.auth import authenticate, login
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import generics
from .serializers import UserSerializer

# Create your views here.

class ContactUsCreateView(generics.CreateAPIView):
    queryset = ContactUs.objects.all()
    serializer_class = ContactUsSerializer
    permission_classes = []

class ForgotPasswordView(APIView):
    permission_classes = []

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # For security, always return success even if user does not exist
            return Response({'success': True})
        # Generate a password reset link (using Django's built-in system)
        from django.contrib.auth.tokens import default_token_generator
        from django.utils.http import urlsafe_base64_encode
        from django.utils.encoding import force_bytes
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_url = request.build_absolute_uri(
            reverse('password-reset-confirm', kwargs={'uidb64': uid, 'token': token})
        )
        send_mail(
            subject='Password Reset for 4SYZ',
            message=f'Click the link to reset your password: {reset_url}',
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@4syz.com'),
            recipient_list=[email],
            fail_silently=True,
        )
        return Response({'success': True})

@api_view(["POST"])
def check_email(request):
    email = request.data.get("email")
    exists = False
    if email:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1 FROM auth_user WHERE email = %s LIMIT 1", [email])
            exists = cursor.fetchone() is not None
    return Response({"exists": exists})

@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get("email")
    password = request.data.get("password")
    user = None
    if email and password:
        from django.contrib.auth import get_user_model
        UserModel = get_user_model()
        try:
            user_obj = UserModel.objects.get(email=email)
            user = authenticate(request, email=email, password=password)
        except UserModel.DoesNotExist:
            user = None
    if user is not None:
        login(request, user)
        return Response({"success": True, "message": "Login successful."})
    else:
        return Response({"success": False, "message": "Invalid email or password."}, status=401)


class UserListView(generics.ListAPIView):
    """Return a list of users. Requires authentication."""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        User = get_user_model()
        return User.objects.all()


class CurrentUserView(APIView):
    """Return the currently authenticated user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
