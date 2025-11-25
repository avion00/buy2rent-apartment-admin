import uuid
from django.db import models
from apartments.models import Apartment
from vendors.models import Vendor


class Delivery(models.Model):
    STATUS_CHOICES = [
        ('Scheduled', 'Scheduled'),
        ('In Transit', 'In Transit'),
        ('Delivered', 'Delivered'),
        ('Issue Reported', 'Issue Reported'),
    ]
    
    # Secure UUID Primary Key
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True,
        help_text="Unique UUID identifier for security"
    )
    
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE, related_name='deliveries')
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='deliveries')
    order_reference = models.CharField(max_length=100)
    expected_date = models.DateField()
    actual_date = models.DateField(null=True, blank=True)
    received_by = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Scheduled')
    notes = models.TextField(blank=True)
    proof_photos = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-expected_date']
        verbose_name_plural = 'Deliveries'
    
    def __str__(self):
        return f"{self.order_reference} - {self.apartment.name}"
