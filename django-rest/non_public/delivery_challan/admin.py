from django.contrib import admin
from .models import delivery_challan

@admin.register(delivery_challan)
class DeliveryChallanAdmin(admin.ModelAdmin):
    list_display = ['challan_number', 'client', 'date', 'status', 'invoice_number', 'created_by']
    list_filter = ['client', 'status', 'date', 'invoice_submission', 'created_at']
    search_fields = ['challan_number', 'client__name', 'invoice_number']
    ordering = ['-created_at']
    readonly_fields = ['id', 'challan_number', 'created_at', 'updated_at', 'pod_upload_date']
