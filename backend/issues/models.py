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
        ('Escalated', 'Escalated'),
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
    
    # AI Email Automation fields
    vendor_last_replied_at = models.DateTimeField(null=True, blank=True, help_text="Last time vendor replied")
    first_sent_at = models.DateTimeField(null=True, blank=True, help_text="First email sent to vendor")
    followup_count = models.IntegerField(default=0, help_text="Number of follow-up emails sent")
    sla_response_hours = models.IntegerField(default=24, help_text="Expected response time in hours")
    last_summary = models.TextField(blank=True, help_text="AI-generated conversation summary")
    last_summary_at = models.DateTimeField(null=True, blank=True, help_text="When summary was last updated")
    next_action = models.TextField(blank=True, help_text="AI-suggested next action")
    
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
        ('Admin', 'Admin'),
    ]
    
    MESSAGE_TYPE_CHOICES = [
        ('email', 'Email'),
        ('internal', 'Internal Note'),
        ('system', 'System Message'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending_approval', 'Pending Approval'),
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('failed', 'Failed'),
        ('received', 'Received'),
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
    
    # Enhanced email tracking fields
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPE_CHOICES, default='internal')
    subject = models.CharField(max_length=500, blank=True)
    email_from = models.EmailField(blank=True)
    email_to = models.EmailField(blank=True)
    email_message_id = models.CharField(max_length=255, blank=True, help_text="Email Message-ID header")
    email_thread_id = models.CharField(max_length=255, blank=True, help_text="Email thread identifier")
    in_reply_to = models.CharField(max_length=255, blank=True)
    
    # AI and approval fields
    ai_generated = models.BooleanField(default=False)
    ai_confidence = models.FloatField(null=True, blank=True, help_text="AI confidence score (0-1)")
    ai_model = models.CharField(max_length=50, blank=True, default='gpt-4')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='internal')
    approved_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_messages')
    approved_at = models.DateTimeField(null=True, blank=True)
    
    # Control fields
    requires_approval = models.BooleanField(default=False)
    manual_override = models.BooleanField(default=False, help_text="Message was manually edited")
    
    class Meta:
        ordering = ['timestamp']
        indexes = [
            models.Index(fields=['issue', 'timestamp']),
            models.Index(fields=['email_thread_id']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.sender} - {self.timestamp}"
