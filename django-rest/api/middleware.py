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
        ]
        if any(request.path.startswith(path) for path in public_paths):
            return None
        if not request.user.is_authenticated:
            return None
        
        # Special handling for /api/users/me/ - allow authenticated users regardless of group
        if request.path == "/api/users/me/":
            return None
        
        # Define specific API routes with their permission requirements
        api_routes = {
            # DeliveryChallan routes - only for 4syz group
            "/api/deliverychallan/": ["4syz"],
            # Add other API routes here as needed
            # "/api/other-endpoint/": ["4syz", "client_group_name"],
        }
        
        # Check if the request path matches any specific API route
        for api_path, allowed_groups in api_routes.items():
            if request.path.startswith(api_path):
                # Check if user is in one of the allowed groups
                user_groups = list(request.user.groups.all())
                if not user_groups:
                    return HttpResponseForbidden("No group assigned.")
                
                # Check if user's group is in the allowed groups for this API route
                user_group_names = [group.name for group in user_groups]
                if not any(group_name in allowed_groups for group_name in user_group_names):
                    return HttpResponseForbidden(f"Access denied. Required groups: {', '.join(allowed_groups)}")
                
                # Allow access to this API route
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