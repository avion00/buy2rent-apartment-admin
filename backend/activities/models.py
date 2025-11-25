import uuid
from django.db import models
from apartments.models import Apartment


class Activity(models.Model):
    TYPE_CHOICES = [
        ('product', 'Product'),
        ('payment', 'Payment'),
        ('delivery', 'Delivery'),
        ('issue', 'Issue'),
        ('ai', 'AI'),
        ('status', 'Status'),
    ]
    
    # Secure UUID Primary Key
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True,
        help_text="Unique UUID identifier for security"
    )
    
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE, related_name='activities')
    timestamp = models.DateTimeField(auto_now_add=True)
    actor = models.CharField(max_length=255)
    icon = models.CharField(max_length=50)
    summary = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = 'Activities'
    
    def __str__(self):
        return f"{self.actor} - {self.summary[:50]}"


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
