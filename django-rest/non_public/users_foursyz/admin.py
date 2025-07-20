from django.contrib import admin
from .models import UserFoursyz


@admin.register(UserFoursyz)
class UserFoursyzAdmin(admin.ModelAdmin):
    list_display = ['user', 'foursyz', 'role', 'department', 'position', 'is_active', 'created_at']
    list_filter = ['role', 'department', 'is_active', 'foursyz']
    search_fields = ['user__username', 'user__email', 'department', 'position']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'foursyz', 'role')
        }),
        ('Profile Information', {
            'fields': ('department', 'position', 'phone')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    ) 