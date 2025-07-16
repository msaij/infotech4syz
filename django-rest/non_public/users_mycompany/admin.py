from django.contrib import admin
from .models import users_mycompany

@admin.register(users_mycompany)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'user_type', 'role', 'company', 'client', 'department', 'position', 'is_active']
    list_filter = ['user_type', 'role', 'is_active', 'company', 'client']
    search_fields = ['user__username', 'user__email', 'department', 'position']
    ordering = ['user__username']
    readonly_fields = ['created_at', 'updated_at']
