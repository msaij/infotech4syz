from django.db import models

# Create your models here.

class contact_us(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    message = models.TextField()
    phone = models.CharField(max_length=20, blank=True)
    company_name = models.CharField(max_length=255, blank=True)
    zip_code = models.CharField(max_length=10)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'contact_us'
    
    def __str__(self):
        return f"{self.name} - {self.zip_code}"
