from django.contrib import admin
from .models import QueryClient


@admin.register(QueryClient)
class QueryClientAdmin(admin.ModelAdmin):
    list_display = ['title', 'raised_by', 'assigned_to', 'status', 'priority', 'category', 'created_at']
    list_filter = ['status', 'priority', 'category', 'created_at', 'raised_by__client']
    search_fields = ['title', 'description', 'raised_by__user__username', 'assigned_to__user__username', 'raised_by__client__name']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Query Information', {
            'fields': ('title', 'description', 'category')
        }),
        ('Assignment', {
            'fields': ('raised_by', 'assigned_to')
        }),
        ('Status & Priority', {
            'fields': ('status', 'priority')
        }),
        ('Resolution', {
            'fields': ('resolved_at', 'resolution_notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    ) 