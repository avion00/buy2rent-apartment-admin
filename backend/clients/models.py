import uuid
from django.db import models
from django.core.validators import EmailValidator


class Client(models.Model):
    ACCOUNT_STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
    ]
    
    # Secure UUID Primary Key
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True,
        help_text="Unique UUID identifier for security"
    )
    
    TYPE_CHOICES = [
        ('Investor', 'Investor'),
        ('Buy2Rent Internal', 'Buy2Rent Internal'),
    ]
    
    name = models.CharField(max_length=255)
    email = models.EmailField(validators=[EmailValidator()])
    phone = models.CharField(max_length=20, blank=True)
    account_status = models.CharField(
        max_length=20, 
        choices=ACCOUNT_STATUS_CHOICES, 
        default='Active'
    )
    type = models.CharField(
        max_length=20, 
        choices=TYPE_CHOICES, 
        default='Investor'
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['account_status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['name']),
        ]
        verbose_name = 'Client'
        verbose_name_plural = 'Clients'
    
    def __str__(self):
        return self.name
