from rest_framework import permissions

class IsCompanyUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                hasattr(request.user, 'profile') and 
                request.user.profile.user_type == 'company')

class IsClientUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                hasattr(request.user, 'profile') and 
                request.user.profile.user_type == 'client')

class IsCompanyAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                hasattr(request.user, 'profile') and 
                request.user.profile.role == 'admin')

class IsClientAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                hasattr(request.user, 'profile') and 
                request.user.profile.user_type == 'client' and
                request.user.profile.role == 'admin')

class IsManagerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                hasattr(request.user, 'profile') and 
                request.user.profile.role in ['admin', 'manager'])

class IsCompanyOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.profile.company == obj.company

class IsClientOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.profile.client == obj.client

class IsDeliveryChallanOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.profile.user_type == 'company':
            return request.user.profile.company == obj.company
        elif request.user.profile.user_type == 'client':
            return request.user.profile.client == obj.client
        return False 