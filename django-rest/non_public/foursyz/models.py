from django.db import models


class Foursyz(models.Model):
    """Model for 4syz company details"""
    name = models.CharField(max_length=255, default="4syz")
    primary_email_domain = models.CharField(max_length=255, default="4syz.com")
    secondary_email_domain = models.CharField(max_length=255, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'foursyz'
        verbose_name = "4syz Company"
        verbose_name_plural = "4syz Company"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Ensure only one record exists
        if not self.pk and Foursyz.objects.exists():
            raise ValueError("Only one 4syz company record can exist")
        super().save(*args, **kwargs) 