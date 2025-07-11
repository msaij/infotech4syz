from django.http import HttpResponseForbidden
from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth.models import Group
from .models import Company

class ClientRoutingMiddleware(MiddlewareMixin):
    def process_view(self, request, view_func, view_args, view_kwargs):
        # Allow unauthenticated/public endpoints
        public_paths = [
            "/api/check-username/",
            "/api/session-login/",
            "/api/session-logout/",
            "/api/csrf/",
            "/api/forgot-password/",
            "/api/users/me/",  # Allow user info endpoint
        ]
        if any(request.path.startswith(path) for path in public_paths):
            return None
        if not request.user.is_authenticated:
            return None
        path = request.path
        user_groups = list(request.user.groups.all())
        if not user_groups:
            return HttpResponseForbidden("No group assigned.")
        # Assume first group is primary (or iterate for more complex logic)
        group = user_groups[0]
        try:
            client_group = group.client_details
        except Company.DoesNotExist:
            return HttpResponseForbidden("Group not registered as a client.")
        if group.name == "4syz":
            if not path.startswith("/start/"):
                return HttpResponseForbidden("4syz users can only access /start/* routes.")
        else:
            if not path.startswith("/clients/"):
                return HttpResponseForbidden("Client users can only access /clients/* routes.")
        return None 