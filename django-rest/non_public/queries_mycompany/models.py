from django.db import models
from django.contrib.auth.models import User

class queries_mycompany(models.Model):
    QUERY_TYPE_CHOICES = [
        ('company', 'Company Query'),
        ('client', 'Client Query'),
    ]
    
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    query_type = models.CharField(max_length=10, choices=QUERY_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    priority = models.CharField(max_length=20, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ], default='medium')
    
    # For company queries
    company = models.ForeignKey('details_mycompany.details_mycompany', on_delete=models.CASCADE, null=True, blank=True, related_name='queries')
    
    # For client queries
    client = models.ForeignKey('details_clients.details_clients', on_delete=models.CASCADE, null=True, blank=True, related_name='queries')
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_queries')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_queries')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'queries_mycompany'
        verbose_name_plural = "Queries"
        ordering = ['-created_at']
        constraints = [
            models.CheckConstraint(
                check=models.Q(query_type='company', company__isnull=False) | 
                      models.Q(query_type='client', client__isnull=False),
                name='valid_query'
            )
        ]
    
    def __str__(self):
        return f"{self.title} - {self.status}"
