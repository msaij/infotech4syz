from django.db import models
import uuid

# Create your models here.
def generate_uuid_hex():
    return uuid.uuid4().hex

class ContactUs(models.Model):
    id = models.CharField(primary_key=True, max_length=32, default=generate_uuid_hex, editable=False)
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15, blank=True, null=True)
    email = models.EmailField(max_length=320)
    city = models.CharField(max_length=50, blank=True, null=True)
    zip = models.CharField(max_length=10)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'contact_us'

    def __str__(self):
        return f"{self.name} <{self.email}>"
