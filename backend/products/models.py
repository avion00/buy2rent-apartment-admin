import uuid
from django.db import models
from django.core.validators import MinValueValidator
from apartments.models import Apartment
from vendors.models import Vendor
from .category_models import ProductCategory, ImportSession


class Product(models.Model):
    AVAILABILITY_CHOICES = [
        ('In Stock', 'In Stock'),
        ('Backorder', 'Backorder'),
        ('Out of Stock', 'Out of Stock'),
    ]
    
    STATUS_CHOICES = [
        ('Design Approved', 'Design Approved'),
        ('Ready To Order', 'Ready To Order'),
        ('Ordered', 'Ordered'),
        ('Waiting For Stock', 'Waiting For Stock'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
        ('Damaged', 'Damaged'),
        ('Wrong Item', 'Wrong Item'),
        ('Missing', 'Missing'),
        ('Replacement Requested', 'Replacement Requested'),
        ('Replacement Approved', 'Replacement Approved'),
        ('Payment Pending', 'Payment Pending'),
        ('Payment Partial', 'Payment Partial'),
        ('Payment Complete', 'Payment Complete'),
        ('Closed', 'Closed'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('Unpaid', 'Unpaid'),
        ('Partially Paid', 'Partially Paid'),
        ('Paid', 'Paid'),
    ]
    
    ISSUE_STATE_CHOICES = [
        ('No Issue', 'No Issue'),
        ('Issue Reported', 'Issue Reported'),
        ('AI Resolving', 'AI Resolving'),
        ('Human Action Required', 'Human Action Required'),
        ('Pending Vendor Response', 'Pending Vendor Response'),
        ('Resolved', 'Resolved'),
    ]
    
    # Secure UUID Primary Key
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True,
        help_text="Unique UUID identifier for security"
    )
    
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE, related_name='products')
    category = models.ForeignKey(
        ProductCategory, 
        on_delete=models.CASCADE, 
        related_name='products',
        null=True,
        blank=True,
        help_text="Category from Excel sheet"
    )
    import_session = models.ForeignKey(
        ImportSession,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products',
        help_text="Import session that created this product"
    )
    
    # Basic Product Information
    product = models.CharField(max_length=255, help_text="Product name/title")
    description = models.TextField(blank=True, help_text="Detailed product description")
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='products', null=True, blank=True)
    vendor_link = models.URLField(blank=True)
    sku = models.CharField(max_length=100, blank=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)], default=0)
    qty = models.PositiveIntegerField(default=1)
    availability = models.CharField(max_length=20, choices=AVAILABILITY_CHOICES, default='In Stock')
    status = models.JSONField(default=list, blank=True, help_text="Array of status tags")
    
    # Product Specifications
    dimensions = models.CharField(max_length=255, blank=True, help_text="Product dimensions")
    weight = models.CharField(max_length=100, blank=True, help_text="Product weight")
    material = models.CharField(max_length=255, blank=True, help_text="Product material")
    color = models.CharField(max_length=100, blank=True, help_text="Product color")
    model_number = models.CharField(max_length=100, blank=True, help_text="Model/Part number")
    
    # Excel Import Fields - Additional columns from your Excel files
    sn = models.CharField(max_length=50, blank=True, help_text="Serial Number from Excel")
    product_image = models.URLField(max_length=500, blank=True, help_text="Primary product image URL (used for all image operations: upload, import, display)")
    cost = models.CharField(max_length=100, blank=True, help_text="Cost as text from Excel")
    total_cost = models.CharField(max_length=100, blank=True, help_text="Total Cost as text from Excel")
    link = models.URLField(max_length=500, blank=True, help_text="Product Link from Excel")
    size = models.CharField(max_length=100, blank=True, help_text="Size from Excel")
    nm = models.CharField(max_length=100, blank=True, help_text="NM measurement from Excel")
    plusz_nm = models.CharField(max_length=100, blank=True, help_text="Plus NM from Excel")
    price_per_nm = models.CharField(max_length=100, blank=True, help_text="Price per NM from Excel")
    price_per_package = models.CharField(max_length=100, blank=True, help_text="Price per Package from Excel")
    nm_per_package = models.CharField(max_length=100, blank=True, help_text="NM per Package from Excel")
    all_package = models.CharField(max_length=100, blank=True, help_text="All Package from Excel")
    package_need_to_order = models.CharField(max_length=100, blank=True, help_text="Package Need to Order from Excel")
    all_price = models.CharField(max_length=100, blank=True, help_text="All Price from Excel")
    
    # Dates
    eta = models.DateField(null=True, blank=True)
    ordered_on = models.DateField(null=True, blank=True)
    expected_delivery_date = models.DateField(null=True, blank=True)
    actual_delivery_date = models.DateField(null=True, blank=True)
    
    # Additional Categories (legacy fields)
    room = models.CharField(max_length=100, blank=True)
    brand = models.CharField(max_length=100, blank=True)
    country_of_origin = models.CharField(max_length=100, blank=True)
    
    # Payment
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='Unpaid')
    payment_due_date = models.DateField(null=True, blank=True)
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    currency = models.CharField(max_length=10, default='HUF')
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Delivery - Basic Information
    delivery_type = models.CharField(max_length=100, blank=True, help_text="Type of delivery: home_courier, parcel_locker, pickup_point, international, same_day")
    delivery_status_tags = models.JSONField(default=list, blank=True, help_text="Array of delivery status tags")
    delivery_address = models.TextField(blank=True)
    delivery_city = models.CharField(max_length=100, blank=True)
    delivery_postal_code = models.CharField(max_length=20, blank=True)
    delivery_country = models.CharField(max_length=100, blank=True)
    delivery_instructions = models.TextField(blank=True)
    delivery_contact_person = models.CharField(max_length=255, blank=True)
    delivery_contact_phone = models.CharField(max_length=20, blank=True)
    delivery_contact_email = models.EmailField(blank=True)
    delivery_time_window = models.CharField(max_length=100, blank=True)
    delivery_notes = models.TextField(blank=True)
    tracking_number = models.CharField(max_length=100, blank=True)
    condition_on_arrival = models.CharField(max_length=100, blank=True)
    
    # Delivery - Sender Information (for courier/international)
    sender = models.CharField(max_length=255, blank=True, help_text="Sender name")
    sender_address = models.TextField(blank=True, help_text="Sender full address")
    sender_phone = models.CharField(max_length=20, blank=True, help_text="Sender phone number")
    
    # Delivery - Recipient Information (for all delivery types)
    recipient = models.CharField(max_length=255, blank=True, help_text="Recipient name")
    recipient_address = models.TextField(blank=True, help_text="Recipient full address")
    recipient_phone = models.CharField(max_length=20, blank=True, help_text="Recipient phone number")
    recipient_email = models.EmailField(blank=True, help_text="Recipient email address")
    
    # Delivery - Parcel Locker Specific
    locker_provider = models.CharField(max_length=100, blank=True, help_text="Locker provider name (e.g., Packeta, GLS ParcelShop)")
    locker_id = models.CharField(max_length=100, blank=True, help_text="Locker ID or code")
    
    # Delivery - Pickup Point Specific
    pickup_provider = models.CharField(max_length=100, blank=True, help_text="Pickup point provider (e.g., DPD Pickup, GLS Point)")
    pickup_location = models.CharField(max_length=255, blank=True, help_text="Pickup point location or address")
    
    # Delivery - International Specific
    customs_description = models.TextField(blank=True, help_text="Customs declaration description")
    item_value = models.CharField(max_length=100, blank=True, help_text="Declared item value for customs")
    hs_category = models.CharField(max_length=100, blank=True, help_text="HS (Harmonized System) category code")
    
    # Delivery - Additional Options
    insurance = models.CharField(max_length=10, default='no', blank=True, help_text="Insurance: yes or no")
    cod = models.CharField(max_length=100, blank=True, help_text="Cash on Delivery amount")
    pickup_time = models.CharField(max_length=100, blank=True, help_text="Pickup time for same-day delivery")
    delivery_deadline = models.CharField(max_length=100, blank=True, help_text="Delivery deadline")
    special_instructions = models.TextField(blank=True, help_text="Special delivery instructions")
    
    # Issues
    issue_state = models.CharField(max_length=30, choices=ISSUE_STATE_CHOICES, default='No Issue')
    issue_type = models.CharField(max_length=100, blank=True)
    issue_description = models.TextField(blank=True)
    replacement_requested = models.BooleanField(default=False)
    replacement_approved = models.BooleanField(default=False)
    replacement_eta = models.DateField(null=True, blank=True)
    replacement_of = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='replacements',
        help_text="Optional: Select the product this item is replacing (leave empty for new products)"
    )
    
    # Images and files
    # DEPRECATED: Use product_image field instead for all image operations
    image_url = models.URLField(max_length=500, blank=True, help_text="DEPRECATED: Use product_image instead")
    image_file = models.ImageField(upload_to='products/images/', blank=True, null=True, help_text="DEPRECATED: Use product_image instead")
    thumbnail_url = models.URLField(max_length=500, blank=True, help_text="Thumbnail image URL")
    gallery_images = models.JSONField(default=list, blank=True, help_text="Additional product images")
    attachments = models.JSONField(default=list, blank=True, help_text="Product documents and files")
    
    # Import metadata
    import_row_number = models.IntegerField(null=True, blank=True, help_text="Row number from Excel import")
    import_data = models.JSONField(default=dict, blank=True, help_text="Raw import data for reference")
    
    # Notes
    notes = models.TextField(blank=True)
    manual_notes = models.TextField(blank=True)
    ai_summary_notes = models.TextField(blank=True)
    
    # Meta
    created_by = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.product} - {self.apartment.name}"
    
    @property
    def total_amount(self):
        return (self.unit_price * self.qty) + self.shipping_cost - self.discount
    
    @property
    def outstanding_balance(self):
        return self.total_amount - self.paid_amount
    
    def get_auto_delivery_status_tags(self):
        """Auto-generate delivery status tags based on dates and state"""
        tags = []
        if self.actual_delivery_date:
            tags.append('Delivered')
        elif self.expected_delivery_date:
            tags.append('Scheduled')
        if self.issue_state != 'No Issue':
            tags.append('Issue Reported')
        return tags
    
    @property
    def order_status_info(self):
        """
        Get order status information for this product.
        Returns a list of order statuses where this product appears.
        """
        from orders.models import OrderItem
        
        # Get all order items that reference this product
        order_items = OrderItem.objects.filter(product=self).select_related('order')
        
        # Collect unique order statuses
        order_statuses = []
        seen_statuses = set()
        
        for item in order_items:
            status = item.order.status
            if status not in seen_statuses:
                order_statuses.append({
                    'status': status,
                    'po_number': item.order.po_number,
                    'order_id': str(item.order.id),
                    'placed_on': item.order.placed_on.isoformat() if item.order.placed_on else None,
                    'quantity': item.quantity,
                    'expected_delivery': item.order.expected_delivery.isoformat() if item.order.expected_delivery else None,
                    'shipping_address': item.order.shipping_address or None,
                })
                seen_statuses.add(status)
        
        return order_statuses
    
    @property
    def has_active_order(self):
        """Check if product has any active orders (draft or sent)"""
        from orders.models import OrderItem
        
        active_statuses = ['draft', 'sent']
        return OrderItem.objects.filter(
            product=self,
            order__status__in=active_statuses
        ).exists()
    
    @property
    def payment_status_from_orders(self):
        """
        Calculate payment status based on payments for orders containing this product.
        Returns 'Paid', 'Partially Paid', or 'Unpaid'
        """
        from orders.models import OrderItem
        from payments.models import Payment
        
        # Get all order items for this product
        order_items = OrderItem.objects.filter(product=self).select_related('order')
        
        if not order_items.exists():
            return 'Unpaid'
        
        total_amount_due = 0
        total_amount_paid = 0
        
        for item in order_items:
            # Calculate this item's share of the order total
            item_total = float(item.quantity) * float(item.unit_price)
            total_amount_due += item_total
            
            # Get payments for this order
            payments = Payment.objects.filter(order=item.order)
            for payment in payments:
                # Check if this specific item is included in the payment
                if payment.order_items.filter(id=item.id).exists():
                    # Calculate proportional payment for this item
                    if payment.total_amount > 0:
                        item_proportion = item_total / float(payment.total_amount)
                        total_amount_paid += float(payment.amount_paid) * item_proportion
        
        if total_amount_due == 0:
            return 'Unpaid'
        
        if total_amount_paid >= total_amount_due:
            return 'Paid'
        elif total_amount_paid > 0:
            return 'Partially Paid'
        else:
            return 'Unpaid'
    
    @property
    def issue_status_info(self):
        """
        Get the latest issue status for this product from the Issues page.
        Returns a dict with status, priority, and type information.
        """
        from issues.models import Issue
        
        # Get the most recent issue for this product
        latest_issue = Issue.objects.filter(product=self).order_by('-created_at').first()
        
        if not latest_issue:
            return {
                'status': 'No Issue',
                'priority': None,
                'type': None,
                'issue_id': None
            }
        
        return {
            'status': latest_issue.status,
            'priority': latest_issue.priority,
            'type': latest_issue.type,
            'issue_id': str(latest_issue.id),
            'created_at': latest_issue.created_at.isoformat() if latest_issue.created_at else None
        }
    
    @property
    def is_ordered(self):
        """Check if product has been ordered"""
        from orders.models import OrderItem
        return OrderItem.objects.filter(product=self).exists()
    
    @property
    def delivery_status_info(self):
        """
        Get delivery status information for this product.
        Returns a list of delivery statuses where this product's orders appear.
        """
        from orders.models import OrderItem
        from deliveries.models import Delivery
        
        # Get all order items that reference this product
        order_items = OrderItem.objects.filter(product=self).select_related('order')
        
        # Collect delivery information from orders
        delivery_statuses = []
        seen_deliveries = set()
        
        for item in order_items:
            # Check if the order has an associated delivery
            try:
                delivery = Delivery.objects.get(order=item.order)
                delivery_key = str(delivery.id)
                
                if delivery_key not in seen_deliveries:
                    # Get the latest location from status history
                    latest_location = None
                    latest_status_history = delivery.status_history.filter(location__isnull=False).exclude(location='').order_by('-created_at').first()
                    if latest_status_history:
                        latest_location = latest_status_history.location
                    
                    delivery_statuses.append({
                        'status': delivery.status,
                        'order_reference': delivery.order_reference,
                        'delivery_id': str(delivery.id),
                        'expected_date': delivery.expected_date.isoformat() if delivery.expected_date else None,
                        'actual_date': delivery.actual_date.isoformat() if delivery.actual_date else None,
                        'tracking_number': delivery.tracking_number,
                        'priority': delivery.priority,
                        'location': latest_location,
                    })
                    seen_deliveries.add(delivery_key)
            except Delivery.DoesNotExist:
                # No delivery record for this order yet
                pass
        
        return delivery_statuses
    
    @property
    def combined_status_info(self):
        """
        Get combined status information including orders and deliveries.
        This provides a comprehensive view of the product's lifecycle.
        """
        order_info = self.order_status_info
        delivery_info = self.delivery_status_info
        
        return {
            'orders': order_info,
            'deliveries': delivery_info,
            'is_ordered': self.is_ordered,
            'has_active_order': self.has_active_order,
        }
