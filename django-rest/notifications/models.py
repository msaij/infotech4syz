from django.db import models
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.utils import timezone


class notification(models.Model):
    """Model for storing user notifications"""
    NOTIFICATION_TYPES = [
        ('info', 'Information'),
        ('success', 'Success'),
        ('warning', 'Warning'),
        ('error', 'Error'),
        ('delivery_update', 'Delivery Update'),
        ('order_status', 'Order Status'),
        ('system', 'System'),
        ('message', 'Message'),
    ]
    
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Generic foreign key for related objects
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Additional data
    metadata = models.JSONField(default=dict, blank=True)
    priority = models.IntegerField(default=0, help_text="Higher number = higher priority")
    
    class Meta:
        db_table = 'notification'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['notification_type', 'created_at']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.notification_type} - {self.recipient.username} - {self.title}"
    
    def mark_as_read(self):
        """Mark notification as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()


class notification_template(models.Model):
    """Model for notification templates"""
    TEMPLATE_TYPES = [
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('push', 'Push Notification'),
        ('in_app', 'In-App Notification'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    template_type = models.CharField(max_length=20, choices=TEMPLATE_TYPES)
    subject = models.CharField(max_length=200, blank=True)
    content = models.TextField()
    variables = models.JSONField(default=list, help_text="List of variables used in template")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notification_template'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.template_type})"


class notification_preference(models.Model):
    """Model for user notification preferences"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')
    
    # Email preferences
    email_notifications = models.BooleanField(default=True)
    email_delivery_updates = models.BooleanField(default=True)
    email_order_status = models.BooleanField(default=True)
    email_system_notifications = models.BooleanField(default=True)
    
    # SMS preferences
    sms_notifications = models.BooleanField(default=False)
    sms_delivery_updates = models.BooleanField(default=False)
    sms_order_status = models.BooleanField(default=False)
    
    # Push notification preferences
    push_notifications = models.BooleanField(default=True)
    push_delivery_updates = models.BooleanField(default=True)
    push_order_status = models.BooleanField(default=True)
    push_system_notifications = models.BooleanField(default=True)
    
    # In-app notification preferences
    in_app_notifications = models.BooleanField(default=True)
    
    # Frequency preferences
    notification_frequency = models.CharField(
        max_length=20,
        choices=[
            ('immediate', 'Immediate'),
            ('hourly', 'Hourly'),
            ('daily', 'Daily'),
            ('weekly', 'Weekly'),
        ],
        default='immediate'
    )
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notification_preference'
    
    def __str__(self):
        return f"Preferences for {self.user.username}"


class message(models.Model):
    """Model for internal messaging between users"""
    MESSAGE_TYPES = [
        ('direct', 'Direct Message'),
        ('group', 'Group Message'),
        ('announcement', 'Announcement'),
        ('support', 'Support'),
    ]
    
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipients = models.ManyToManyField(User, related_name='received_messages')
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES)
    subject = models.CharField(max_length=200, blank=True)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # For group messages
    group_name = models.CharField(max_length=100, blank=True)
    
    # Additional data
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'message'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['sender', 'created_at']),
            models.Index(fields=['message_type', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.message_type} from {self.sender.username} - {self.subject}"


class message_thread(models.Model):
    """Model for organizing messages into threads/conversations"""
    participants = models.ManyToManyField(User, related_name='message_threads')
    subject = models.CharField(max_length=200, blank=True)
    last_message = models.ForeignKey(message, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'message_thread'
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Thread: {self.subject} ({self.participants.count()} participants)"


class notification_log(models.Model):
    """Model for logging notification delivery attempts"""
    notification = models.ForeignKey(notification, on_delete=models.CASCADE, related_name='delivery_logs')
    delivery_method = models.CharField(max_length=20, choices=[
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('push', 'Push Notification'),
        ('in_app', 'In-App'),
    ])
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('failed', 'Failed'),
        ('bounced', 'Bounced'),
    ])
    sent_at = models.DateTimeField(default=timezone.now)
    delivered_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'notification_log'
        ordering = ['-sent_at']
        indexes = [
            models.Index(fields=['delivery_method', 'status']),
            models.Index(fields=['sent_at']),
        ]
    
    def __str__(self):
        return f"{self.delivery_method} - {self.status} - {self.notification.title}"
