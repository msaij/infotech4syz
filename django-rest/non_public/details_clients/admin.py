from django.contrib import admin
from .models import details_clients

@admin.register(details_clients)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['name', 'email_domain', 'short_name', 'contact_person', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'email_domain', 'short_name', 'contact_person']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']
