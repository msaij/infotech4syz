from .models import ContactUs
from .serializers import ContactUsSerializer
from django.contrib.auth.models import User
from django.core.mail import send_mail
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets, mixins
from rest_framework.decorators import action
from django.conf import settings
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.db import connection
from django.contrib.auth import authenticate, login, logout
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import UserSerializer
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.csrf import csrf_protect

# Create your views here.

class ContactUsCreateView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = ContactUsSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            with connection.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO contact_us (name, phone, email, city, zip, message) VALUES (%s, %s, %s, %s, %s, %s)",
                    [
                        data.get('name'),
                        data.get('phone'),
                        data.get('email'),
                        data.get('city'),
                        data.get('zip'),
                        data.get('message'),
                    ],
                )
            return Response({'success': True}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
            reverse('password_reset_confirm', kwargs={'uidb64': uid, 'token': token})
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
def check_username(request):
    username = request.data.get("username")
    exists = False
    if username:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1 FROM auth_user WHERE username = %s LIMIT 1", [username])
            exists = cursor.fetchone() is not None
    return Response({"exists": exists})

class UserViewSet(mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


@api_view(["GET"])
@permission_classes([AllowAny])
def csrf_token(request):
    """Return a CSRF token and ensure the cookie is set."""
    token = get_token(request)
    return Response({"csrfToken": token})


@api_view(["POST"])
@permission_classes([AllowAny])
def logout_view(request):
    """Log out the current user."""
    logout(request)
    return Response({"success": True})

@api_view(["POST"])
@permission_classes([AllowAny])
@csrf_protect
def session_login(request):
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return Response({"success": True})
    return Response({"error": "Invalid credentials."}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@permission_classes([AllowAny])
@csrf_protect
def session_logout(request):
    logout(request)
    return Response({"success": True})
