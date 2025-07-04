from django.contrib import admin

from .models import ContactUs
from .models.deliverychallan import DeliveryChallan

# Register the ContactUs model in the Django admin with custom display fields
@admin.register(ContactUs)
class ContactUsAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "phone", "created_at")

# Register DeliveryChallan model
@admin.register(DeliveryChallan)
class DeliveryChallanAdmin(admin.ModelAdmin):
    list_display = ("challan_number", "customer", "date", "invoice_submission")
    list_filter = ("invoice_submission", "date")
    search_fields = ("challan_number", "customer", "dc_summary")
    readonly_fields = ("challan_number", "id", "created_at", "updated_at")
    date_hierarchy = "date"
    ordering = ("-date", "-created_at")
    
    fieldsets = (
        ("Basic Information", {
            "fields": ("id", "challan_number", "date", "customer")
        }),
        ("Delivery Information", {
            "fields": ("dc_summary", "delivery_executives")
        }),
        ("Invoice Information", {
            "fields": ("invoice_number", "invoice_date", "invoice_submission")
        }),
        ("Acknowledgement", {
            "fields": ("acknowledgement_copy",)
        }),
        ("Timestamps", {
            "fields": ("updated_at", "created_at"),
            "classes": ("collapse",)
        }),
    )

