from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import datetime, date
import uuid

def generate_uuid_hex():
    return uuid.uuid4().hex

class delivery_challan(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.CharField(primary_key=True, max_length=32, default=generate_uuid_hex, editable=False)
    challan_number = models.CharField(max_length=20, unique=True, editable=False, db_index=True)
    date = models.DateField(default=date.today)
    client = models.ForeignKey('details_clients.details_clients', on_delete=models.CASCADE, related_name='delivery_challans')
    dc_summary = models.TextField(blank=True)
    delivery_executives = models.TextField(blank=True)
    invoice_number = models.CharField(max_length=50, blank=True, null=True)
    invoice_date = models.DateField(blank=True, null=True)
    invoice_submission = models.BooleanField(default=False)
    proof_of_delivery = models.FileField(upload_to='proof_of_delivery/', blank=True, null=True)
    pod_upload_date = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_challans')
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'delivery_challan'
        verbose_name = 'Delivery Challan'
        verbose_name_plural = 'Delivery Challans'
        ordering = ['challan_number']
        indexes = [
            models.Index(fields=['challan_number'], name='challan_number_idx'),
            models.Index(fields=['client', 'status'], name='challan_client_status_idx'),
            models.Index(fields=['date'], name='challan_date_idx'),
        ]
    
    def __str__(self):
        return f"{self.challan_number} - {self.client.name}"
    
    def clean(self):
        super().clean()
        if self.date and self.date > date.today():
            raise ValidationError({'date': 'Challan date cannot be in the future.'})
        if self.invoice_date and self.date and self.invoice_date < self.date:
            raise ValidationError({'invoice_date': 'Invoice date cannot be before challan date.'})

    def save(self, *args, **kwargs):
        if not self.challan_number:
            now = self.date or datetime.now().date()
            year = str(now.year)[-2:]
            month = f"{now.month:02d}"
            last = delivery_challan.objects.filter(
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
        
        # Set pod_upload_date only when proof_of_delivery is uploaded or changed
        if self.pk:
            orig = delivery_challan.objects.filter(pk=self.pk).first()
            if orig:
                orig_file = orig.proof_of_delivery
                if not orig_file and self.proof_of_delivery:
                    self.pod_upload_date = timezone.now()
                elif orig_file != self.proof_of_delivery and self.proof_of_delivery:
                    self.pod_upload_date = timezone.now()
        elif self.proof_of_delivery:
            self.pod_upload_date = timezone.now()
        
        super().save(*args, **kwargs)
