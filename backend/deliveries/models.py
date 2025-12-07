import uuid
from django.db import models
from apartments.models import Apartment
from vendors.models import Vendor


class Delivery(models.Model):
    STATUS_CHOICES = [
        ('Scheduled', 'Scheduled'),
        ('In Transit', 'In Transit'),
        ('Delivered', 'Delivered'),
        ('Delayed', 'Delayed'),
        ('Cancelled', 'Cancelled'),
        ('Returned', 'Returned'),
        ('Issue Reported', 'Issue Reported'),
    ]
    
    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Urgent', 'Urgent'),
    ]
    
    # Secure UUID Primary Key
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True,
        help_text="Unique UUID identifier for security"
    )
    
    # Link to Order (optional for backward compatibility)
    order = models.OneToOneField(
        'orders.Order',
        on_delete=models.CASCADE,
        related_name='delivery',
        null=True,
        blank=True,
        help_text="The order this delivery is associated with"
    )
    
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE, related_name='deliveries')
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='deliveries')
    order_reference = models.CharField(max_length=100, help_text="PO Number or order reference")
    
    # Delivery scheduling
    expected_date = models.DateField(help_text="Expected delivery date")
    actual_date = models.DateField(null=True, blank=True, help_text="Actual delivery date")
    time_slot_start = models.TimeField(null=True, blank=True, help_text="Delivery time slot start")
    time_slot_end = models.TimeField(null=True, blank=True, help_text="Delivery time slot end")
    
    # Delivery details
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')
    tracking_number = models.CharField(max_length=100, blank=True, help_text="Shipping tracking number")
    received_by = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Scheduled')
    
    # Additional info
    notes = models.TextField(blank=True)
    proof_photos = models.JSONField(default=list, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-expected_date']
        verbose_name_plural = 'Deliveries'
    
    def __str__(self):
        return f"{self.order_reference} - {self.apartment.name}"
    
    @property
    def time_slot(self):
        """Return formatted time slot string"""
        if self.time_slot_start and self.time_slot_end:
            return f"{self.time_slot_start.strftime('%H:%M')} - {self.time_slot_end.strftime('%H:%M')}"
        return None


class DeliveryStatusHistory(models.Model):
    """Track all status changes for a delivery with notes"""
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True
    )
    
    delivery = models.ForeignKey(
        Delivery, 
        on_delete=models.CASCADE, 
        related_name='status_history'
    )
    
    status = models.CharField(max_length=20, choices=Delivery.STATUS_CHOICES)
    notes = models.TextField(blank=True, help_text="Notes for this status change")
    changed_by = models.CharField(max_length=255, blank=True, help_text="Who made this change")
    
    # For specific status data
    received_by = models.CharField(max_length=255, blank=True, help_text="For Delivered status")
    location = models.CharField(max_length=255, blank=True, help_text="Current location for In Transit")
    delay_reason = models.CharField(max_length=255, blank=True, help_text="Reason for delay")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Delivery Status History'
        verbose_name_plural = 'Delivery Status Histories'
    
    def __str__(self):
        return f"{self.delivery.order_reference} - {self.status} at {self.created_at}"
