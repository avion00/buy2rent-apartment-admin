import uuid
from django.db import models
from apartments.models import Apartment
from products.models import Product
from vendors.models import Vendor


class Issue(models.Model):
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('Pending Vendor Response', 'Pending Vendor Response'),
        ('Resolution Agreed', 'Resolution Agreed'),
        ('Closed', 'Closed'),
    ]
    
    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    ]
    
    # Secure UUID Primary Key
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True,
        help_text="Unique UUID identifier for security"
    )
    
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE, related_name='issues')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='issues')
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='issues')
    type = models.CharField(max_length=100)
    description = models.TextField()
    reported_on = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Open')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')
    expected_resolution = models.DateField(null=True, blank=True)
    vendor_contact = models.CharField(max_length=255, blank=True)
    impact = models.TextField(blank=True)
    replacement_eta = models.DateField(null=True, blank=True)
    ai_activated = models.BooleanField(default=False)
    resolution_status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Open')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.type} - {self.product.product}"
    
    @property
    def product_name(self):
        return self.product.product


class IssuePhoto(models.Model):
    # Secure UUID Primary Key
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True,
        help_text="Unique UUID identifier for security"
    )
    
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='photos')
    url = models.URLField()
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"Photo for {self.issue}"


class AICommunicationLog(models.Model):
    SENDER_CHOICES = [
        ('AI', 'AI'),
        ('Vendor', 'Vendor'),
        ('System', 'System'),
    ]
    
    # Secure UUID Primary Key
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True,
        help_text="Unique UUID identifier for security"
    )
    
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='ai_communication_log')
    timestamp = models.DateTimeField(auto_now_add=True)
    sender = models.CharField(max_length=20, choices=SENDER_CHOICES)
    message = models.TextField()
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"{self.sender} - {self.timestamp}"
