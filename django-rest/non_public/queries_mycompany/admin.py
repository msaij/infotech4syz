from django.contrib import admin
from .models import queries_mycompany

@admin.register(queries_mycompany)
class QueryAdmin(admin.ModelAdmin):
    list_display = ['title', 'query_type', 'status', 'priority', 'company', 'client', 'created_by', 'assigned_to', 'created_at']
    list_filter = ['query_type', 'status', 'priority', 'company', 'client', 'created_at']
    search_fields = ['title', 'description', 'created_by__username', 'assigned_to__username']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
