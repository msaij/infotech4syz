from django.contrib import admin
from .models import delivery_challan

@admin.register(delivery_challan)
class DeliveryChallanAdmin(admin.ModelAdmin):
    list_display = ['challan_number', 'company', 'client', 'product_name', 'quantity', 'total_price', 'status', 'delivery_date', 'created_by']
    list_filter = ['company', 'client', 'status', 'delivery_date', 'created_at']
    search_fields = ['challan_number', 'company__name', 'client__name', 'product_name']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at', 'total_price']
