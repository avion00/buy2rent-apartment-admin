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
    
    # Secure UUID Primary Key
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True,
        help_text="Unique UUID identifier for security"
    )
    
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE, related_name='payments')
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='payments')
    order_reference = models.CharField(max_length=100)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Unpaid')
    last_payment_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    # Many-to-Many relationship with products
    products = models.ManyToManyField(
        'products.Product',
        related_name='payments',
        blank=True,
        help_text="Products included in this payment"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-due_date']
    
    def __str__(self):
        return f"{self.order_reference} - {self.apartment.name}"
    
    @property
    def outstanding_amount(self):
        return self.total_amount - self.amount_paid


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
        ('Cash', 'Cash'),
        ('Check', 'Check'),
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
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    reference_no = models.CharField(max_length=100, blank=True)
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date']
        verbose_name_plural = 'Payment histories'
    
    def __str__(self):
        return f"{self.payment.order_reference} - {self.amount} on {self.date}"
