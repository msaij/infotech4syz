from django.db import models
from django.contrib.auth.models import User
from datetime import datetime

class delivery_challan(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    challan_number = models.CharField(max_length=50, unique=True)
    company = models.ForeignKey('details_mycompany.details_mycompany', on_delete=models.CASCADE, related_name='delivery_challans')
    client = models.ForeignKey('details_clients.details_clients', on_delete=models.CASCADE, related_name='delivery_challans')
    
    # Product details (no separate item table)
    product_name = models.CharField(max_length=255)
    product_sku = models.CharField(max_length=100)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    delivery_address = models.TextField()
    delivery_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_challans')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'delivery_challan'
        verbose_name = 'Delivery Challan'
        verbose_name_plural = 'Delivery Challans'
        ordering = ['challan_number']
        indexes = [
            models.Index(fields=['challan_number'], name='challan_number_idx'),
            models.Index(fields=['company', 'status'], name='challan_company_status_idx'),
            models.Index(fields=['delivery_date'], name='challan_delivery_date_idx'),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(quantity__gt=0),
                name='positive_quantity'
            ),
            models.CheckConstraint(
                check=models.Q(unit_price__gte=0),
                name='positive_unit_price'
            ),
        ]
    
    def __str__(self):
        return f"{self.challan_number} - {self.client.name}"
    
    def save(self, *args, **kwargs):
        # Auto-generate challan number if not provided
        if not self.challan_number:
            now = self.delivery_date or datetime.now().date()
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
        
        # Auto-calculate total price if not set
        if not self.total_price:
            self.total_price = self.quantity * self.unit_price
        
        super().save(*args, **kwargs)
