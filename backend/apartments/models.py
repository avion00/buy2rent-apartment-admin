import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from clients.models import Client


class Apartment(models.Model):
    TYPE_CHOICES = [
        ('furnishing', 'Furnishing'),
        ('renovating', 'Renovating'),
    ]
    
    STATUS_CHOICES = [
        ('Planning', 'Planning'),
        ('Ordering', 'Ordering'),
        ('Delivery', 'Delivery'),
        ('Complete', 'Complete'),
        ('Design Approved', 'Design Approved'),
        ('Renovating', 'Renovating'),
    ]
    
    # Secure UUID Primary Key
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True,
        help_text="Unique UUID identifier for security"
    )
    
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='furnishing')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='apartments')
    address = models.TextField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Planning')
    designer = models.CharField(max_length=255, blank=True)
    start_date = models.DateField()
    due_date = models.DateField()
    progress = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    notes = models.TextField(blank=True)
    extra_data = models.JSONField(default=dict, blank=True, help_text="Additional apartment data")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['client']),
            models.Index(fields=['status']),
            models.Index(fields=['type']),
            models.Index(fields=['created_at']),
            models.Index(fields=['due_date']),
        ]
        verbose_name = 'Apartment'
        verbose_name_plural = 'Apartments'
    
    def __str__(self):
        return self.name
    
    @property
    def owner(self):
        """For backward compatibility with frontend"""
        return self.client.name
