from django.db import models
from django.db.models.signals import post_migrate
from django.dispatch import receiver

# Create your models here.

class details_mycompany(models.Model):
    name = models.CharField(max_length=255)
    email_domain = models.CharField(max_length=100, unique=True)  # e.g., "4syz.com"
    short_name = models.CharField(max_length=50, unique=True)     # e.g., "4syz"
    address = models.TextField()
    phone = models.CharField(max_length=20)
    website = models.URLField(blank=True)
    logo = models.ImageField(upload_to='company_logos/', blank=True)
    is_active = models.BooleanField(default=True)
    is_permanent = models.BooleanField(default=False, help_text="This record cannot be deleted and ensures there's always one company record")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'details_mycompany'
        verbose_name = 'Company'
        verbose_name_plural = "Companies"
        ordering = ['name']
        indexes = [
            models.Index(fields=['email_domain'], name='company_email_domain_idx'),
            models.Index(fields=['short_name'], name='company_short_name_idx'),
            models.Index(fields=['is_permanent'], name='company_permanent_idx'),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(is_active__in=[True, False]),
                name='valid_company_status'
            ),
        ]
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        # If this record is being marked as permanent, unmark all others
        if self.is_permanent:
            details_mycompany.objects.exclude(pk=self.pk).update(is_permanent=False)
        # If no permanent record exists and this is the first record, make it permanent
        elif not details_mycompany.objects.filter(is_permanent=True).exists():
            self.is_permanent = True
        
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        # Prevent deletion of permanent record
        if self.is_permanent:
            raise models.ProtectedError(
                "Cannot delete the permanent company record. This record ensures system integrity.",
                self
            )
        super().delete(*args, **kwargs)

# Signal to create default permanent record if none exists
@receiver(post_migrate)
def create_default_company(sender, **kwargs):
    if sender.name == 'non_public.details_mycompany':
        if not details_mycompany.objects.filter(is_permanent=True).exists():
            # Create default permanent company record
            details_mycompany.objects.create(
                name="Infotech4Syz",
                email_domain="4syz.com",
                short_name="4syz",
                address="123 Business Street, Tech City, TC 12345",
                phone="+1-555-0123",
                website="https://4syz.com",
                is_active=True,
                is_permanent=True
            )
