import uuid
from django.db import models
from django.core.validators import MinValueValidator
from apartments.models import Apartment
from vendors.models import Vendor


class Order(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('confirmed', 'Confirmed'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
        ('received', 'Received'),
        ('cancelled', 'Cancelled'),
        ('returned', 'Returned'),
    ]
    
    # Secure UUID Primary Key
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True,
        help_text="Unique UUID identifier for security"
    )
    
    # Core order information
    po_number = models.CharField(max_length=100, unique=True, help_text="Purchase Order Number")
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE, related_name='orders')
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='orders')
    
    # Order details
    items_count = models.PositiveIntegerField(default=0, help_text="Total number of items in this order")
    total = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)], help_text="Total order amount")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    confirmation_code = models.CharField(max_length=100, blank=True, help_text="Vendor confirmation reference")
    
    # Important dates
    placed_on = models.DateField(help_text="Date when order was placed")
    expected_delivery = models.DateField(null=True, blank=True, help_text="Expected delivery date")
    actual_delivery = models.DateField(null=True, blank=True, help_text="Actual delivery date")
    
    # Additional information
    notes = models.TextField(blank=True, help_text="Order notes and comments")
    shipping_address = models.TextField(blank=True, help_text="Shipping address if different from apartment")
    tracking_number = models.CharField(max_length=100, blank=True, help_text="Shipping tracking number")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-placed_on', '-created_at']
        indexes = [
            models.Index(fields=['po_number']),
            models.Index(fields=['vendor', 'placed_on']),
            models.Index(fields=['apartment', 'placed_on']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.po_number} - {self.vendor.name}"
    
    @property
    def is_delivered(self):
        return self.status == 'delivered' and self.actual_delivery is not None


class OrderItem(models.Model):
    # Secure UUID Primary Key
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True,
        help_text="Unique UUID identifier for security"
    )
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product_name = models.CharField(max_length=255, help_text="Name of the product")
    sku = models.CharField(max_length=100, blank=True, help_text="Product SKU")
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    total_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    
    # Product details
    description = models.TextField(blank=True)
    specifications = models.JSONField(default=dict, blank=True, help_text="Product specifications as JSON")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['product_name']
    
    def __str__(self):
        return f"{self.product_name} x{self.quantity}"
    
    def save(self, *args, **kwargs):
        # Auto-calculate total price
        self.total_price = self.unit_price * self.quantity
        super().save(*args, **kwargs)
