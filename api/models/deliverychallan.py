from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.core.exceptions import ValidationError
import uuid
from datetime import datetime, date
from decimal import Decimal

# Utility function to generate a unique 32-character hex string for primary keys
def generate_uuid_hex():
    return uuid.uuid4().hex

class DeliveryChallan(models.Model):
    """
    Standardized Delivery Challan model for managing delivery documents.
    
    This model represents a delivery challan (delivery note) that tracks
    the delivery of goods from supplier to customer.
    """
    
    # Primary key and identification
    id = models.CharField(
        primary_key=True, 
        max_length=32, 
        default=generate_uuid_hex, 
        editable=False,
        help_text="Unique identifier for the delivery challan"
    )
    
    challan_number = models.CharField(
        max_length=20, 
        unique=True, 
        editable=False,
        db_index=True,
        help_text="Auto-generated challan number in format YYMM####"
    )
    
    # Basic information
    date = models.DateField(
        default=date.today,
        help_text="Date of challan creation"
    )
    
    customer = models.CharField(
        max_length=200,
        help_text="Name of the customer"
    )
    
    # Delivery information
    dc_summary = models.TextField(
        blank=True,
        help_text="Summary of items being delivered"
    )
    
    delivery_executives = models.TextField(
        blank=True,
        help_text="Names of delivery executives assigned"
    )
    
    # Invoice information
    invoice_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Invoice number if generated"
    )
    
    invoice_date = models.DateField(
        blank=True,
        null=True,
        help_text="Date when invoice was generated"
    )
    
    invoice_submission = models.BooleanField(
        default=False,
        help_text="Whether invoice has been submitted"
    )
    
    # acknowledgement_copy: file upload for signed copy
    acknowledgement_copy = models.FileField(
        upload_to='acknowledgement_copies/',
        blank=True,
        null=True,
        help_text="Scanned copy or image of the signed acknowledgement (optional)"
    )
    
    # Timestamps
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when challan was last updated"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when challan was created"
    )
    
    # Meta information
    class Meta:
        db_table = 'delivery_challan'
        verbose_name = 'Delivery Challan'
        verbose_name_plural = 'Delivery Challans'
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['customer']),
            models.Index(fields=['created_at']),
        ]

    def clean(self):
        """Custom validation for the model."""
        super().clean()
        
        # Validate challan date is not in the future
        if self.date and self.date > date.today():
            raise ValidationError({
                'date': 'Challan date cannot be in the future.'
            })
        
        # Validate invoice date is not before challan date
        if self.invoice_date and self.date and self.invoice_date < self.date:
            raise ValidationError({
                'invoice_date': 'Invoice date cannot be before challan date.'
            })

    def save(self, *args, **kwargs):
        """Override save method to auto-generate challan number."""
        # Auto-generate challan_number if not set
        if not self.challan_number:
            now = self.date or datetime.now().date()
            year = str(now.year)[-2:]
            month = f"{now.month:02d}"
            
            # Find the last challan for this month
            last = DeliveryChallan.objects.filter(
                challan_number__startswith=year+month
            ).order_by('-challan_number').first()
            
            if last and last.challan_number[4:]:
                try:
                    last_seq = int(last.challan_number[4:])
                except ValueError:
                    last_seq = 0
            else:
                last_seq = 0
                
            new_seq = last_seq + 1
            self.challan_number = f"{year}{month}{new_seq:05d}"
        
        super().save(*args, **kwargs)

    def __str__(self):
        """String representation of the model."""
        return f"Challan {self.challan_number} - {self.customer}"

    def get_absolute_url(self):
        """Get the absolute URL for the challan."""
        from django.urls import reverse
        return reverse('delivery-challan-detail', kwargs={'pk': self.pk})
