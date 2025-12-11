import uuid
from django.db import models
from django.conf import settings
from apartments.models import Apartment


class Activity(models.Model):
    TYPE_CHOICES = [
        ('product', 'Product'),
        ('payment', 'Payment'),
        ('delivery', 'Delivery'),
        ('issue', 'Issue'),
        ('ai', 'AI'),
        ('status', 'Status'),
        ('order', 'Order'),
        ('apartment', 'Apartment'),
        ('client', 'Client'),
        ('vendor', 'Vendor'),
        ('user', 'User'),
    ]
    
    ACTION_CHOICES = [
        ('created', 'Created'),
        ('updated', 'Updated'),
        ('deleted', 'Deleted'),
        ('status_changed', 'Status Changed'),
        ('payment_received', 'Payment Received'),
        ('delivered', 'Delivered'),
        ('assigned', 'Assigned'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    # Secure UUID Primary Key
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True,
        help_text="Unique UUID identifier for security"
    )
    
    # Optional apartment link (for backward compatibility)
    apartment = models.ForeignKey(
        Apartment, 
        on_delete=models.CASCADE, 
        related_name='activities',
        null=True,
        blank=True
    )
    
    # User who performed the action
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='activities'
    )
    
    # Activity details
    activity_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES, default='created')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    # Reference to the related object
    object_id = models.CharField(max_length=100, blank=True, help_text="UUID of related object")
    object_type = models.CharField(max_length=50, blank=True, help_text="Model name of related object")
    
    # Additional metadata
    metadata = models.JSONField(default=dict, blank=True)
    
    # Legacy fields (for backward compatibility)
    timestamp = models.DateTimeField(auto_now_add=True)
    actor = models.CharField(max_length=255, blank=True)
    icon = models.CharField(max_length=50, blank=True)
    summary = models.TextField(blank=True)
    type = models.CharField(max_length=20, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Activities'
    
    def __str__(self):
        return f"{self.title} - {self.action}"
    
    @classmethod
    def log(cls, activity_type, action, title, description='', user=None, apartment=None, 
            object_id='', object_type='', metadata=None):
        """Helper method to create activity logs"""
        return cls.objects.create(
            activity_type=activity_type,
            action=action,
            title=title,
            description=description,
            user=user,
            apartment=apartment,
            object_id=str(object_id) if object_id else '',
            object_type=object_type,
            metadata=metadata or {},
            actor=user.get_full_name() if user else 'System',
            summary=description or title,
            type=activity_type,
        )


class AINote(models.Model):
    SENDER_CHOICES = [
        ('AI', 'AI'),
        ('Admin', 'Admin'),
        ('Vendor', 'Vendor'),
    ]
    
    # Secure UUID Primary Key
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True,
        help_text="Unique UUID identifier for security"
    )
    
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE, related_name='ai_notes')
    timestamp = models.DateTimeField(auto_now_add=True)
    sender = models.CharField(max_length=20, choices=SENDER_CHOICES)
    content = models.TextField()
    email_subject = models.CharField(max_length=255, blank=True)
    related_to = models.CharField(max_length=100, blank=True)  # issue ID, product ID, etc.
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.sender} - {self.timestamp}"


class ManualNote(models.Model):
    # Secure UUID Primary Key
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True,
        help_text="Unique UUID identifier for security"
    )
    
    apartment = models.OneToOneField(Apartment, on_delete=models.CASCADE, related_name='manual_note')
    content = models.TextField()
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Manual note for {self.apartment.name}"
