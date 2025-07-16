from django.db import models
from django.contrib.auth.models import User

class users_clients(models.Model):
    """Model for client user profiles"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='client_profile')
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    
    class Meta:
        db_table = 'users_clients'
    
    def __str__(self):
        return f"Client: {self.user.username}"
