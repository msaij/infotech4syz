from django.db import models
from django.contrib.auth.models import User
from non_public.foursyz.models import Foursyz


class UserFoursyz(models.Model):
    """Model for 4syz company users"""
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('admin', 'Admin'),
        ('user', 'User'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='foursyz_profile')
    foursyz = models.ForeignKey(Foursyz, on_delete=models.CASCADE, related_name='users')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    department = models.CharField(max_length=100, blank=True, null=True)
    position = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users_4syz'
        verbose_name = "4syz User"
        verbose_name_plural = "4syz Users"

    def __str__(self):
        return f"{self.user.username} - {self.foursyz.name}"

    def clean(self):
        from django.core.exceptions import ValidationError
        # Validate email domain
        if self.user.email:
            email_domain = self.user.email.split('@')[1].lower()
            foursyz_domains = [self.foursyz.primary_email_domain.lower()]
            if self.foursyz.secondary_email_domain:
                foursyz_domains.append(self.foursyz.secondary_email_domain.lower())
            
            if email_domain not in foursyz_domains:
                raise ValidationError(f"Email domain must be one of: {', '.join(foursyz_domains)}") 