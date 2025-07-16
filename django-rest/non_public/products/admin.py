from django.contrib import admin
from .models import products, products_clientproductassignment

@admin.register(products)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'sku', 'price', 'company', 'is_active', 'created_at']
    list_filter = ['company', 'is_active', 'created_at']
    search_fields = ['name', 'sku', 'company__name']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(products_clientproductassignment)
class ClientProductAssignmentAdmin(admin.ModelAdmin):
    list_display = ['client', 'product', 'is_active', 'assigned_by', 'assigned_at']
    list_filter = ['client', 'is_active', 'assigned_at']
    search_fields = ['client__name', 'product__name']
    ordering = ['-assigned_at']
    readonly_fields = ['assigned_at']
