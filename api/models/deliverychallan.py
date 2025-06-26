from django.db import models
import uuid

# Utility function to generate a unique 32-character hex string for primary keys
def generate_uuid_hex():
    return uuid.uuid4().hex

class DeliveryChallan(models.Model):
    id = models.CharField(primary_key=True, max_length=32, default=generate_uuid_hex, editable=False)
    challan_number = models.CharField(max_length=50, unique=True)
    date = models.DateField()
    customer_name = models.CharField(max_length=100)
    customer_address = models.TextField()
    items = models.TextField(help_text="JSON or comma-separated list of items")
    total_quantity = models.PositiveIntegerField()
    remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'delivery_challan'

    def __str__(self):
        return f"Challan {self.challan_number} for {self.customer_name}"
