from django.urls import path
from django.http import JsonResponse

def public_health(request):
    """Public health check endpoint."""
    return JsonResponse({
        "status": "healthy",
        "service": "Public API",
        "version": "2.0.0"
    })

urlpatterns = [
    path('health/', public_health, name='public_health'),
] 