from .models import ContactUs, DeliveryChallan
from .serializers import ContactUsSerializer, UserSerializer, DeliveryChallanSerializer
from django.contrib.auth.models import User
from django.core.mail import send_mail
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets, mixins, permissions
from rest_framework.decorators import action
from django.conf import settings
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.db import connection
from django.contrib.auth import authenticate, login, logout
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, DjangoModelPermissions
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.csrf import csrf_protect

# RBAC Permission class
class RolePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        # Use Django's built-in permission system
        required_perms = getattr(view, 'required_perms', [])
        for perm in required_perms:
            if not request.user.has_perm(perm):
                return False
        return True

# API endpoint for creating ContactUs entries from the frontend contact form
class ContactUsCreateView(APIView):
    permission_classes = []  # Allow unauthenticated access

    def post(self, request):
        """Accepts contact form data and creates a ContactUs record."""
        serializer = ContactUsSerializer(data=request.data)
        if serializer.is_valid():
            contact = ContactUs.objects.create(**serializer.validated_data)
            return Response({'success': True}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# API endpoint for handling forgot password requests
class ForgotPasswordView(APIView):
    permission_classes = []  # Allow unauthenticated access

    def post(self, request):
        """Sends a password reset email if the user exists. Always returns success for security."""
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

# API endpoint to check if a username exists (for login/registration UX)
@api_view(["POST"])
def check_username(request):
    """Checks if a username exists in the database using the User model."""
    username = request.data.get("username")
    exists = False
    if username:
        exists = User.objects.filter(username=username).exists()
    return Response({"exists": exists})

# ViewSet for authenticated user info and profile endpoints
class UserViewSet(mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request):
        """Returns the current authenticated user's info, including permissions and groups."""
        serializer = self.get_serializer(request.user)
        return Response({
            **serializer.data,
            "groups": list(request.user.groups.values_list("name", flat=True)),
            "permissions": list(request.user.get_all_permissions()),
        })

# API endpoint to get a CSRF token for frontend use
@api_view(["GET"])
@permission_classes([AllowAny])
def csrf_token(request):
    """Return a CSRF token and ensure the cookie is set for frontend requests."""
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
    """Log in a user with username and password."""
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
    """Log out the current user."""
    logout(request)
    return Response({"success": True})
