from django.db import models
from django.contrib.auth.models import User


class Permission(models.Model):
    """Model for system permissions"""
    name = models.CharField(max_length=100, unique=True)
    codename = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    app_label = models.CharField(max_length=100)  # Which app this permission belongs to
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'rbac_permissions'
        verbose_name = "Permission"
        verbose_name_plural = "Permissions"
        ordering = ['app_label', 'name']

    def __str__(self):
        return f"{self.app_label}.{self.codename}"


class Role(models.Model):
    """Model for user roles"""
    ROLE_TYPES = [
        ('foursyz', '4syz Role'),
        ('client', 'Client Role'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    role_type = models.CharField(max_length=20, choices=ROLE_TYPES)
    description = models.TextField(blank=True)
    permissions = models.ManyToManyField(Permission, through='RolePermission', blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'rbac_roles'
        verbose_name = "Role"
        verbose_name_plural = "Roles"
        ordering = ['name']

    def __str__(self):
        return self.name


class RolePermission(models.Model):
    """Through model for Role-Permission relationship"""
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE)
    granted = models.BooleanField(default=True)
    granted_at = models.DateTimeField(auto_now_add=True)
    granted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'rbac_rolepermission'
        unique_together = ['role', 'permission']
        verbose_name = "Role Permission"
        verbose_name_plural = "Role Permissions"

    def __str__(self):
        return f"{self.role.name} - {self.permission.codename}"


class UserRole(models.Model):
    """Model for user-role assignments"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_roles')
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='role_assignments')
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'rbac_user_roles'
        unique_together = ['user', 'role']
        verbose_name = "User Role"
        verbose_name_plural = "User Roles"

    def __str__(self):
        return f"{self.user.username} - {self.role.name}" 