from django.contrib.auth.models import User
from .models import Permission, Role, UserRole


# Permission constants
class Permissions:
    # 4syz permissions
    FOURSYZ_VIEW = 'foursyz.view_foursyz'
    FOURSYZ_EDIT = 'foursyz.edit_foursyz'
    
    # User management permissions
    USERS_VIEW = 'users.view_users'
    USERS_CREATE = 'users.create_users'
    USERS_EDIT = 'users.edit_users'
    USERS_DELETE = 'users.delete_users'
    
    # Client management permissions
    CLIENTS_VIEW = 'clients.view_clients'
    CLIENTS_CREATE = 'clients.create_clients'
    CLIENTS_EDIT = 'clients.edit_clients'
    CLIENTS_DELETE = 'clients.delete_clients'
    
    # Query permissions
    QUERIES_VIEW = 'queries.view_queries'
    QUERIES_CREATE = 'queries.create_queries'
    QUERIES_EDIT = 'queries.edit_queries'
    QUERIES_RESOLVE = 'queries.resolve_queries'
    
    # RBAC permissions
    ROLES_VIEW = 'rbac.view_roles'
    ROLES_CREATE = 'rbac.create_roles'
    ROLES_EDIT = 'rbac.edit_roles'
    ROLES_DELETE = 'rbac.delete_roles'
    ROLES_ASSIGN = 'rbac.assign_roles'


# Role constants
class Roles:
    FOURSYZ_OWNER = '4syz Owner'
    FOURSYZ_ADMIN = '4syz Admin'
    FOURSYZ_USER = '4syz User'
    CLIENT_ADMIN = 'Client Admin'
    CLIENT_USER = 'Client User'


def has_permission(user: User, permission_codename: str) -> bool:
    """Check if user has a specific permission"""
    if not user.is_authenticated:
        return False
    
    # Superuser has all permissions
    if user.is_superuser:
        return True
    
    # Check user roles and their permissions
    user_roles = UserRole.objects.filter(user=user, is_active=True, role__is_active=True)
    
    for user_role in user_roles:
        role_permissions = user_role.role.rolepermission_set.filter(
            granted=True,
            permission__codename=permission_codename
        )
        if role_permissions.exists():
            return True
    
    return False


def has_role(user: User, role_name: str) -> bool:
    """Check if user has a specific role"""
    if not user.is_authenticated:
        return False
    
    return UserRole.objects.filter(
        user=user,
        role__name=role_name,
        is_active=True,
        role__is_active=True
    ).exists()


def get_user_roles(user: User) -> list:
    """Get all active roles for a user"""
    if not user.is_authenticated:
        return []
    
    return list(UserRole.objects.filter(
        user=user,
        is_active=True,
        role__is_active=True
    ).values_list('role__name', flat=True))


def get_user_permissions(user: User) -> list:
    """Get all permissions for a user"""
    if not user.is_authenticated:
        return []
    
    if user.is_superuser:
        return list(Permission.objects.values_list('codename', flat=True))
    
    user_roles = UserRole.objects.filter(user=user, is_active=True, role__is_active=True)
    permissions = set()
    
    for user_role in user_roles:
        role_permissions = user_role.role.rolepermission_set.filter(granted=True)
        for role_permission in role_permissions:
            permissions.add(role_permission.permission.codename)
    
    return list(permissions) 