import uuid
from django.db import models
from django.core.validators import EmailValidator, URLValidator


class Vendor(models.Model):
    # Secure UUID Primary Key
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True,
        help_text="Unique UUID identifier for security"
    )
    
    name = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255, blank=True)
    contact_person = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True, validators=[EmailValidator()])
    phone = models.CharField(max_length=20, blank=True)
    website = models.URLField(blank=True, validators=[URLValidator()])

    # Extended profile fields to support frontend vendor pages
    logo = models.CharField(max_length=16, blank=True, help_text="Optional short logo or emoji")
    lead_time = models.CharField(max_length=100, blank=True, help_text="Typical delivery lead time, e.g. '7-14 days'")
    reliability = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,
        help_text="Reliability score from 0.00 to 5.00",
    )
    orders_count = models.PositiveIntegerField(default=0, help_text="Cached total number of orders for this vendor")
    active_issues = models.PositiveIntegerField(default=0, help_text="Cached count of active issues for this vendor")

    # Address information
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)

    # Business information
    tax_id = models.CharField(max_length=100, blank=True)
    business_type = models.CharField(max_length=100, blank=True)
    year_established = models.CharField(max_length=10, blank=True)
    employee_count = models.CharField(max_length=20, blank=True)

    # Classification & offerings
    category = models.CharField(max_length=100, blank=True)
    product_categories = models.TextField(blank=True, help_text="Comma-separated list of product categories")
    certifications = models.TextField(blank=True)
    specializations = models.TextField(blank=True)

    # Terms & conditions
    payment_terms = models.CharField(max_length=100, blank=True)
    delivery_terms = models.CharField(max_length=255, blank=True)
    warranty_period = models.CharField(max_length=100, blank=True)
    return_policy = models.TextField(blank=True)
    minimum_order = models.CharField(max_length=100, blank=True)

    # Additional notes
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['email']),
            models.Index(fields=['created_at']),
        ]
        verbose_name = 'Vendor'
        verbose_name_plural = 'Vendors'
    
    def __str__(self):
        return self.name
