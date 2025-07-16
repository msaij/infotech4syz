from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

def validate_email_domain(email, expected_domain):
    """Validate that email domain matches expected domain"""
    domain = email.split('@')[1].lower()
    expected_domain = expected_domain.lower()
    
    if domain != expected_domain:
        raise ValidationError(f'Email domain must be {expected_domain}')

def validate_company_email_domain(email, company):
    """Validate email domain for company users"""
    validate_email_domain(email, company.email_domain)

def validate_client_email_domain(email, client):
    """Validate email domain for client users"""
    validate_email_domain(email, client.email_domain)

class users_mycompany(models.Model):
    USER_TYPE_CHOICES = [
        ('company', 'Company User'),
        ('client', 'Client User'),
    ]
    
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('manager', 'Manager'),
        ('user', 'Regular User'),
        ('viewer', 'Viewer'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    
    # For company users
    company = models.ForeignKey('details_mycompany.details_mycompany', on_delete=models.CASCADE, null=True, blank=True, related_name='users')
    
    # For client users
    client = models.ForeignKey('details_clients.details_clients', on_delete=models.CASCADE, null=True, blank=True, related_name='users')
    
    phone = models.CharField(max_length=20, blank=True)
    department = models.CharField(max_length=100, blank=True)
    position = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users_mycompany'
        ordering = ['-created_at', 'user__username']
        constraints = [
            models.CheckConstraint(
                check=models.Q(user_type='company', company__isnull=False) | 
                      models.Q(user_type='client', client__isnull=False),
                name='valid_user_profile'
            )
        ]
    
    def clean(self):
        super().clean()
        if self.user_type == 'company' and self.company:
            validate_company_email_domain(self.user.email, self.company)
        elif self.user_type == 'client' and self.client:
            validate_client_email_domain(self.user.email, self.client)
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.user.username} - {self.user_type} - {self.role}"
