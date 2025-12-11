import uuid
from django.db import models
from django.core.validators import MinValueValidator
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from apartments.models import Apartment
from vendors.models import Vendor


class Payment(models.Model):
    STATUS_CHOICES = [
        ('Unpaid', 'Unpaid'),
        ('Partial', 'Partial'),
        ('Paid', 'Paid'),
        ('Overdue', 'Overdue'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('Bank Transfer', 'Bank Transfer'),
        ('Card Payment', 'Card Payment'),
        ('Cash', 'Cash'),
    ]
    
    # Secure UUID Primary Key
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True,
        help_text="Unique UUID identifier for security"
    )
    
    # Link to Order (primary relationship)
    order = models.ForeignKey(
        'orders.Order',
        on_delete=models.CASCADE,
        related_name='payments',
        null=True,
        blank=True,
        help_text="Order this payment is for"
    )
    
    # These fields are auto-populated from order but kept for flexibility
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE, related_name='payments')
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='payments')
    order_reference = models.CharField(max_length=100)
    
    # Amount fields (using integers for HUF - no decimals)
    total_amount = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Subtotal amount from order items"
    )
    shipping_cost = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Shipping cost (optional)"
    )
    discount = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Discount amount (optional)"
    )
    amount_paid = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Amount paid so far"
    )
    
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Unpaid')
    last_payment_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    # Payment method
    payment_method = models.CharField(
        max_length=20, 
        choices=PAYMENT_METHOD_CHOICES, 
        default='Bank Transfer'
    )
    reference_number = models.CharField(max_length=100, blank=True)
    
    # Bank Transfer details
    bank_name = models.CharField(max_length=100, blank=True)
    account_holder = models.CharField(max_length=100, blank=True)
    account_number = models.CharField(max_length=50, blank=True)
    iban = models.CharField(max_length=50, blank=True)
    
    # Card Payment details
    card_holder = models.CharField(max_length=100, blank=True)
    card_last_four = models.CharField(max_length=4, blank=True)
    
    # Many-to-Many relationship with order items (not products directly)
    order_items = models.ManyToManyField(
        'orders.OrderItem',
        related_name='payments',
        blank=True,
        help_text="Order items included in this payment"
    )
    
    # Keep products for backward compatibility
    products = models.ManyToManyField(
        'products.Product',
        related_name='payments',
        blank=True,
        help_text="Products included in this payment (legacy)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-due_date']
    
    def __str__(self):
        return f"{self.order_reference} - {self.apartment.name}"
    
    @property
    def final_total(self):
        """Calculate final total: subtotal + shipping - discount"""
        return self.total_amount + self.shipping_cost - self.discount
    
    @property
    def outstanding_amount(self):
        """Calculate outstanding balance: final_total - amount_paid"""
        return self.final_total - self.amount_paid
    
    def save(self, *args, **kwargs):
        """Auto-update status based on payment amounts"""
        if self.amount_paid <= 0:
            self.status = 'Unpaid'
        elif self.amount_paid >= self.final_total:
            self.status = 'Paid'
        else:
            self.status = 'Partial'
        super().save(*args, **kwargs)


def update_product_payment_status(payment):
    """Update payment status for all products in this payment"""
    from products.models import Product
    
    for product in payment.products.all():
        # Calculate total paid for this product across all payments
        total_paid = 0
        for pmt in product.payments.all():
            if pmt.status in ['Paid', 'Partial']:
                total_paid += float(pmt.amount_paid)
        
        # Calculate product total (unit_price * qty)
        product_total = float(product.unit_price) * product.qty
        
        # Update product payment status
        if total_paid >= product_total:
            product.payment_status = 'Paid'
        elif total_paid > 0:
            product.payment_status = 'Partially Paid'
        else:
            product.payment_status = 'Unpaid'
        
        product.paid_amount = total_paid
        product.payment_amount = product_total
        product.save(update_fields=['payment_status', 'paid_amount', 'payment_amount'])


@receiver(post_save, sender=Payment)
def payment_saved(sender, instance, created, **kwargs):
    """Update product payment status when payment is saved"""
    if instance.products.exists():
        update_product_payment_status(instance)


@receiver(post_delete, sender=Payment)
def payment_deleted(sender, instance, **kwargs):
    """Update product payment status when payment is deleted"""
    products = list(instance.products.all())
    for product in products:
        # Recalculate payment status for each product
        total_paid = 0
        for pmt in product.payments.exclude(id=instance.id):
            if pmt.status in ['Paid', 'Partial']:
                total_paid += float(pmt.amount_paid)
        
        product_total = float(product.unit_price) * product.qty
        
        if total_paid >= product_total:
            product.payment_status = 'Paid'
        elif total_paid > 0:
            product.payment_status = 'Partially Paid'
        else:
            product.payment_status = 'Unpaid'
        
        product.paid_amount = total_paid
        product.save(update_fields=['payment_status', 'paid_amount'])


class PaymentHistory(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('Bank Transfer', 'Bank Transfer'),
        ('Credit Card', 'Credit Card'),
        ('Card Payment', 'Card Payment'),
        ('Cash', 'Cash'),
        ('Check', 'Check'),
        ('Wire Transfer', 'Wire Transfer'),
    ]
    
    # Secure UUID Primary Key
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True,
        help_text="Unique UUID identifier for security"
    )
    
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='payment_history')
    date = models.DateField()
    amount = models.PositiveIntegerField(
        validators=[MinValueValidator(0)],
        help_text="Payment amount in HUF"
    )
    method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    reference_no = models.CharField(max_length=100, blank=True)
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name_plural = 'Payment histories'
    
    def __str__(self):
        return f"{self.payment.order_reference} - {self.amount} HUF on {self.date}"
    
    def save(self, *args, **kwargs):
        """After saving payment history, update the parent payment's amount_paid"""
        super().save(*args, **kwargs)
        # Recalculate total amount paid from all history records
        total_paid = self.payment.payment_history.aggregate(
            total=models.Sum('amount')
        )['total'] or 0
        # Update parent payment
        self.payment.amount_paid = total_paid
        self.payment.last_payment_date = self.date
        self.payment.save()
