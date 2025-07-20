from django.contrib import admin
from .models import Permission, Role, RolePermission, UserRole


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ['name', 'codename', 'app_label', 'created_at']
    list_filter = ['app_label', 'created_at']
    search_fields = ['name', 'codename', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ['name', 'role_type', 'is_active', 'created_at']
    list_filter = ['role_type', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):
    list_display = ['role', 'permission', 'granted', 'granted_at', 'granted_by']
    list_filter = ['granted', 'granted_at', 'role__role_type']
    search_fields = ['role__name', 'permission__name']
    readonly_fields = ['granted_at']


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'assigned_at', 'assigned_by', 'is_active']
    list_filter = ['is_active', 'assigned_at', 'role__role_type']
    search_fields = ['user__username', 'user__email', 'role__name']
    readonly_fields = ['assigned_at'] 