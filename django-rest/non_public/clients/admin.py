from django.contrib import admin
from .models import Client


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['name', 'primary_email_domain', 'secondary_email_domain', 'contact_person', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'primary_email_domain', 'secondary_email_domain', 'contact_person', 'contact_email']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'primary_email_domain', 'secondary_email_domain')
        }),
        ('Contact Information', {
            'fields': ('address', 'phone', 'website', 'contact_person', 'contact_email')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    ) 