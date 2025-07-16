from django.db import models
from django.contrib.auth.models import User

class products(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    sku = models.CharField(max_length=100, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    company = models.ForeignKey('details_mycompany.details_mycompany', on_delete=models.CASCADE, related_name='products')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'products'
        verbose_name = 'Product'
        verbose_name_plural = 'Products'
        ordering = ['name']
        indexes = [
            models.Index(fields=['sku'], name='product_sku_idx'),
            models.Index(fields=['company', 'is_active'], name='product_company_active_idx'),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(price__gte=0),
                name='positive_price'
            ),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.sku})"

class products_clientproductassignment(models.Model):
    client = models.ForeignKey('details_clients.details_clients', on_delete=models.CASCADE, related_name='product_assignments')
    product = models.ForeignKey(products, on_delete=models.CASCADE, related_name='client_assignments')
    is_active = models.BooleanField(default=True)
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='product_assignments_made')
    
    class Meta:
        db_table = 'products_clientproductassignment'
        verbose_name = 'Client Product Assignment'
        verbose_name_plural = 'Client Product Assignments'
        ordering = ['-assigned_at']
        unique_together = ['client', 'product']
        indexes = [
            models.Index(fields=['client', 'is_active'], name='client_product_active_idx'),
        ]
    
    def __str__(self):
        return f"{self.client.name} - {self.product.name}"
