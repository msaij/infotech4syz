from django.contrib import admin
from .models import UserClient


@admin.register(UserClient)
class UserClientAdmin(admin.ModelAdmin):
    list_display = ['user', 'client', 'role', 'department', 'position', 'is_active', 'created_at']
    list_filter = ['role', 'department', 'is_active', 'client']
    search_fields = ['user__username', 'user__email', 'department', 'position', 'client__name']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'client', 'role')
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