from django.db import models


class Client(models.Model):
    """Model for client companies"""
    name = models.CharField(max_length=255)
    primary_email_domain = models.CharField(max_length=255)
    secondary_email_domain = models.CharField(max_length=255, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    contact_person = models.CharField(max_length=255, blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'clients'
        verbose_name = "Client"
        verbose_name_plural = "Clients"

    def __str__(self):
        return self.name

    def get_email_domains(self):
        """Return list of valid email domains for this client"""
        domains = [self.primary_email_domain.lower()]
        if self.secondary_email_domain:
            domains.append(self.secondary_email_domain.lower())
        return domains 