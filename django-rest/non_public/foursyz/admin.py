from django.contrib import admin
from .models import Foursyz


@admin.register(Foursyz)
class FoursyzAdmin(admin.ModelAdmin):
    list_display = ['name', 'primary_email_domain', 'secondary_email_domain', 'phone', 'created_at']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'primary_email_domain', 'secondary_email_domain')
        }),
        ('Contact Information', {
            'fields': ('address', 'phone', 'website')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    ) 