from django.contrib import admin
from django.core.exceptions import PermissionDenied
from .models import details_mycompany

@admin.register(details_mycompany)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'email_domain', 'short_name', 'phone', 'is_active', 'is_permanent', 'created_at']
    list_filter = ['is_active', 'is_permanent', 'created_at']
    search_fields = ['name', 'email_domain', 'short_name']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']
    
    def has_delete_permission(self, request, obj=None):
        # Prevent deletion of permanent records
        if obj and obj.is_permanent:
            return False
        return super().has_delete_permission(request, obj)
    
    def delete_model(self, request, obj):
        # Prevent deletion of permanent records
        if obj.is_permanent:
            raise PermissionDenied("Cannot delete the permanent company record.")
        super().delete_model(request, obj)
    
    def delete_queryset(self, request, queryset):
        # Prevent bulk deletion if it includes permanent records
        if queryset.filter(is_permanent=True).exists():
            raise PermissionDenied("Cannot delete permanent company records.")
        super().delete_queryset(request, queryset)
    
    def get_actions(self, request):
        actions = super().get_actions(request)
        # Remove delete action if user doesn't have permission
        if 'delete_selected' in actions:
            del actions['delete_selected']
        return actions
