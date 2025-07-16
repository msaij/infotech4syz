from django.db import models

class details_clients(models.Model):
    name = models.CharField(max_length=255)
    email_domain = models.CharField(max_length=100, unique=True)  # e.g., "linkedin.com"
    short_name = models.CharField(max_length=50, unique=True)     # e.g., "linkedin"
    address = models.TextField()
    phone = models.CharField(max_length=20)
    website = models.URLField(blank=True)
    contact_person = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'details_clients'
        ordering = ['name']
    
    def __str__(self):
        return self.name
