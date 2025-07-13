from django.contrib import admin
from .models import ContactUs, DeliveryChallan, Company

# Register the ContactUs model in the Django admin with custom display fields
@admin.register(ContactUs)
class ContactUsAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "phone", "created_at")

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("client_name", "group", "domain", "contact_email", "is_active")
    search_fields = ("client_name", "domain", "contact_email")
    list_filter = ("is_active",)

@admin.register(DeliveryChallan)
class DeliveryChallanAdmin(admin.ModelAdmin):
    list_display = ("challan_number", "customer", "date", "invoice_submission", "proof_of_delivery", "pod_upload_date")
    list_filter = ("invoice_submission", "date", "pod_upload_date")
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
        ("Proof of Delivery", {
            "fields": ("proof_of_delivery", "pod_upload_date")
        }),
        ("Timestamps", {
            "fields": ("updated_at", "created_at"),
            "classes": ("collapse",)
        }),
    )

