from django.contrib import admin
from .models import contact_us

@admin.register(contact_us)
class ContactUsAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'company_name', 'zip_code', 'is_read', 'created_at']
    search_fields = ['name', 'email', 'company_name', 'zip_code']
    list_filter = ['is_read', 'created_at']
    ordering = ['-created_at']
    readonly_fields = ['created_at']
