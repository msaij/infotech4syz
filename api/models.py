from django.db import models
import uuid

# Create your models here.

def _uuid_bytes():
    """Return a random UUID as 16 bytes."""
    return uuid.uuid4().bytes


class ContactUs(models.Model):
    id = models.BinaryField(primary_key=True, default=_uuid_bytes, editable=False, max_length=16)
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
