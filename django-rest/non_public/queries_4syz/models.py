from django.db import models
from django.contrib.auth.models import User
from non_public.users_foursyz.models import UserFoursyz


class Query4syz(models.Model):
    """Model for queries raised by 4syz users to owner"""
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    raised_by = models.ForeignKey(UserFoursyz, on_delete=models.CASCADE, related_name='queries_raised')
    assigned_to = models.ForeignKey(UserFoursyz, on_delete=models.CASCADE, related_name='queries_assigned', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    category = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(blank=True, null=True)
    resolution_notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'queries_4syz'
        verbose_name = "4syz Query"
        verbose_name_plural = "4syz Queries"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.raised_by.user.username}"

    def save(self, *args, **kwargs):
        # Auto-assign to owner if not assigned
        if not self.assigned_to:
            owner = UserFoursyz.objects.filter(role='owner').first()
            if owner:
                self.assigned_to = owner
        super().save(*args, **kwargs) 