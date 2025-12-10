import uuid
from django.db import models
from apartments.models import Apartment
from products.models import Product
from vendors.models import Vendor
from orders.models import Order, OrderItem


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
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name='issues')
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='issues')
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True, related_name='issues')
    order_item = models.ForeignKey(OrderItem, on_delete=models.SET_NULL, null=True, blank=True, related_name='issues')
    product_name = models.CharField(max_length=255, blank=True, help_text="Product name for issues without linked product")
    type = models.CharField(max_length=500, help_text="Issue type(s), can be comma-separated for multiple types")
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
    
    # Resolution fields
    resolution_type = models.CharField(max_length=100, blank=True, help_text="Type of resolution (e.g., Replacement, Refund, Repair)")
    resolution_notes = models.TextField(blank=True, help_text="Notes about the resolution")
    
    # Additional Info fields
    delivery_date = models.DateField(null=True, blank=True, help_text="Expected or actual delivery date")
    invoice_number = models.CharField(max_length=100, blank=True, help_text="Invoice number for reference")
    tracking_number = models.CharField(max_length=100, blank=True, help_text="Shipping tracking number")
    
    # Notification settings
    auto_notify_vendor = models.BooleanField(default=True, help_text="Automatically notify vendor about this issue")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        if self.product:
            return f"{self.type} - {self.product.product}"
        return f"{self.type} - {self.product_name or 'Unknown Product'}"
    
    def get_product_name(self):
        if self.product:
            return self.product.product
        if self.order_item:
            return self.order_item.product_name
        return self.product_name or 'Unknown Product'


class IssueItem(models.Model):
    """Represents a product/order item within an issue - allows multiple products per issue"""
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True,
        help_text="Unique UUID identifier for security"
    )
    
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='items')
    order_item = models.ForeignKey(OrderItem, on_delete=models.SET_NULL, null=True, blank=True, related_name='issue_items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name='issue_items')
    product_name = models.CharField(max_length=255, blank=True, help_text="Product name for display")
    quantity_affected = models.PositiveIntegerField(default=1, help_text="Quantity of this product affected")
    issue_types = models.CharField(max_length=500, blank=True, help_text="Issue types for this specific product")
    description = models.TextField(blank=True, help_text="Issue description specific to this product")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.product_name or 'Unknown'} - {self.issue}"
    
    def get_product_image(self):
        """Get product image URL"""
        if self.order_item and self.order_item.product_image_url:
            return self.order_item.product_image_url
        if self.order_item and self.order_item.product:
            product = self.order_item.product
            return product.product_image or product.image_url or (product.image_file.url if product.image_file else None)
        if self.product:
            return self.product.product_image or self.product.image_url or (self.product.image_file.url if self.product.image_file else None)
        return None


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
