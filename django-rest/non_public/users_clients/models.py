from django.db import models
from django.contrib.auth.models import User
from non_public.clients.models import Client


class UserClient(models.Model):
    """Model for client users"""
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('user', 'User'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='client_profile')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='users')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    department = models.CharField(max_length=100, blank=True, null=True)
    position = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users_clients'
        verbose_name = "Client User"
        verbose_name_plural = "Client Users"

    def __str__(self):
        return f"{self.user.username} - {self.client.name}"

    def clean(self):
        from django.core.exceptions import ValidationError
        # Validate email domain
        if self.user.email:
            email_domain = self.user.email.split('@')[1].lower()
            client_domains = self.client.get_email_domains()
            
            if email_domain not in client_domains:
                raise ValidationError(f"Email domain must be one of: {', '.join(client_domains)}") 