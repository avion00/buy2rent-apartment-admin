import uuid
from django.db import models
from apartments.models import Apartment


class ProductCategory(models.Model):
    """
    Model to represent categories from Excel sheets
    Each sheet in an Excel file becomes a category
    """
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True
    )
    
    # Basic Information
    name = models.CharField(max_length=255, help_text="Category name (from Excel sheet name)")
    apartment = models.ForeignKey(
        Apartment, 
        on_delete=models.CASCADE, 
        related_name='product_categories'
    )
    
    # Import Information
    import_file_name = models.CharField(max_length=255, blank=True)
    import_date = models.DateTimeField(auto_now_add=True)
    sheet_name = models.CharField(max_length=255, help_text="Original Excel sheet name")
    
    # Category Details
    description = models.TextField(blank=True)
    room_type = models.CharField(max_length=100, blank=True)
    priority = models.IntegerField(default=0, help_text="Display order priority")
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Meta
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['priority', 'name']
        unique_together = ['apartment', 'sheet_name']
    
    def __str__(self):
        return f"{self.name} - {self.apartment.name}"
    
    @property
    def product_count(self):
        return self.products.count()


class ImportSession(models.Model):
    """
    Track import sessions for better management
    """
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True
    )
    
    apartment = models.ForeignKey(
        Apartment, 
        on_delete=models.CASCADE, 
        related_name='import_sessions'
    )
    
    # File Information
    file_name = models.CharField(max_length=255)
    file_size = models.BigIntegerField()
    file_type = models.CharField(max_length=50)  # 'xlsx', 'xls', 'csv'
    
    # Import Results
    total_sheets = models.IntegerField(default=0)
    total_products = models.IntegerField(default=0)
    successful_imports = models.IntegerField(default=0)
    failed_imports = models.IntegerField(default=0)
    
    # Status
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Error Tracking
    error_log = models.JSONField(default=list, blank=True)
    
    # Timestamps
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-started_at']
    
    def __str__(self):
        return f"Import {self.file_name} - {self.apartment.name}"
