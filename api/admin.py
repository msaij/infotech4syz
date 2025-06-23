from django.contrib import admin

from .models import ContactUs

# Register the ContactUs model in the Django admin with custom display fields
@admin.register(ContactUs)
class ContactUsAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "phone", "created_at")

