from django.db import models
from django.contrib.auth.models import Group
import string, random

def generate_unique_id():
    chars = string.ascii_letters + string.digits
    return ''.join(random.choices(chars, k=11))

class Company(models.Model):
    id = models.CharField(primary_key=True, max_length=11, unique=True, default=generate_unique_id, editable=False)
    group = models.OneToOneField(Group, on_delete=models.CASCADE, related_name='client_details')
    client_name = models.CharField(max_length=200)
    contact_email = models.EmailField(blank=True, null=True)
    domain = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.client_name or self.group.name

    class Meta:
        db_table = 'companies'
        verbose_name = 'Company'
        verbose_name_plural = 'Companies' 