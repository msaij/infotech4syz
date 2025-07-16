from django.db import models
from django.contrib.auth.models import User

class queries_clients(models.Model):
    """Model for client queries"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='client_queries')
    subject = models.CharField(max_length=200)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=[
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ], default='open')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    
    class Meta:
        db_table = 'queries_clients'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Query: {self.subject} - {self.user.username}"
