from rest_framework import serializers
from .models import Product
from .category_models import ProductCategory, ImportSession
from apartments.serializers import ApartmentSerializer
from vendors.serializers import VendorSerializer


class ProductSerializer(serializers.ModelSerializer):
    apartment_details = ApartmentSerializer(source='apartment', read_only=True)
    vendor_details = VendorSerializer(source='vendor', read_only=True)
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    category_details = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    outstanding_balance = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    status_tags = serializers.ListField(read_only=True)
    delivery_status_tags = serializers.ListField(read_only=True)
    
    # Enhanced image URL fields that provide full URLs
    image_url = serializers.SerializerMethodField()
    product_image = serializers.SerializerMethodField()
    
    # Frontend compatibility fields (camelCase versions)
    imageUrl = serializers.SerializerMethodField()
    vendorLink = serializers.URLField(source='vendor_link', read_only=True)
    unitPrice = serializers.DecimalField(source='unit_price', max_digits=10, decimal_places=2, read_only=True)
    expectedDeliveryDate = serializers.DateField(source='expected_delivery_date', read_only=True)
    actualDeliveryDate = serializers.DateField(source='actual_delivery_date', read_only=True)
    paymentAmount = serializers.DecimalField(source='payment_amount', max_digits=10, decimal_places=2, read_only=True)
    paidAmount = serializers.DecimalField(source='paid_amount', max_digits=10, decimal_places=2, read_only=True)
    paymentStatus = serializers.CharField(source='payment_status', read_only=True)
    paymentDueDate = serializers.DateField(source='payment_due_date', read_only=True)
    issueState = serializers.CharField(source='issue_state', read_only=True)
    orderedOn = serializers.DateField(source='ordered_on', read_only=True)
    deliveryAddress = serializers.CharField(source='delivery_address', read_only=True)
    deliveryCity = serializers.CharField(source='delivery_city', read_only=True)
    statusTags = serializers.ListField(source='status_tags', read_only=True)
    deliveryStatusTags = serializers.ListField(source='delivery_status_tags', read_only=True)
    
    def validate_replacement_of(self, value):
        """
        Validate replacement_of field with user-friendly error messages
        """
        if value is None:
            # It's perfectly fine to leave this empty
            return value
        
        # Check if the product exists
        if not Product.objects.filter(id=value.id).exists():
            raise serializers.ValidationError(
                f"Product with ID '{value.id}' does not exist. "
                "Please select an existing product or leave this field empty for new products."
            )
        
        # Prevent self-reference
        if hasattr(self, 'instance') and self.instance and value.id == self.instance.id:
            raise serializers.ValidationError(
                "A product cannot be a replacement of itself. Please select a different product."
            )
        
        return value
    
    def get_category_details(self, obj):
        """Get category details"""
        if obj.category:
            return {
                'id': obj.category.id,
                'name': obj.category.name,
                'sheet_name': obj.category.sheet_name,
                'room_type': obj.category.room_type,
            }
        return None
    
    def get_image_url(self, obj):
        """Get full image URL"""
        return self._get_full_image_url(obj.image_url)
    
    def get_product_image(self, obj):
        """Get full product image URL"""
        return self._get_full_image_url(obj.product_image)
    
    def get_imageUrl(self, obj):
        """Get full image URL (camelCase for frontend compatibility)"""
        # Check image_file first (uploaded files), then image_url, then product_image
        if obj.image_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image_file.url)
            return obj.image_file.url
        return self._get_full_image_url(obj.image_url or obj.product_image)
    
    def _get_full_image_url(self, image_path):
        """Convert relative image path to full URL"""
        if not image_path:
            return None
            
        # Skip invalid URLs (like file:// protocol)
        if image_path.startswith(('file://', 'ftp://', 'data:')):
            return None
            
        # If it's already a full URL, return as is
        if image_path.startswith(('http://', 'https://')):
            return image_path
            
        # If it's a relative path starting with /media/, build full URL
        if image_path.startswith('/media/'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(image_path)
            else:
                # Fallback: assume localhost for development
                return f"http://localhost:8000{image_path}"
        
        # If it's just a filename or relative path, prepend /media/
        if not image_path.startswith('/'):
            image_path = f"/media/{image_path}"
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(image_path)
            else:
                return f"http://localhost:8000{image_path}"
                
        return image_path
    
    def validate_image_url(self, value):
        """
        Validate image URL length and format
        """
        if value and len(value) > 500:
            raise serializers.ValidationError(
                f"Image URL is too long ({len(value)} characters). Maximum allowed is 500 characters."
            )
        return value
    
    class Meta:
        model = Product
        fields = [
            'id', 'apartment', 'apartment_details', 'category', 'category_details', 'category_name',
            'import_session', 'product', 'description', 'vendor', 'vendor_details', 
            'vendor_name', 'vendor_link', 'sku', 'unit_price', 'qty', 'availability', 
            'status', 'dimensions', 'weight', 'material', 'color', 'model_number',
            # Excel Import Fields
            'sn', 'product_image', 'cost', 'total_cost', 'link', 'size', 'nm', 'plusz_nm',
            'price_per_nm', 'price_per_package', 'nm_per_package', 'all_package', 
            'package_need_to_order', 'all_price',
            # Dates
            'eta', 'ordered_on', 'expected_delivery_date', 'actual_delivery_date',
            'room', 'brand', 'country_of_origin', 'payment_status', 
            'payment_due_date', 'payment_amount', 'paid_amount', 'currency', 
            'shipping_cost', 'discount', 'total_amount', 'outstanding_balance',
            'delivery_type', 'delivery_address', 'delivery_city', 'delivery_postal_code',
            'delivery_country', 'delivery_instructions', 'delivery_contact_person',
            'delivery_contact_phone', 'delivery_contact_email', 'delivery_time_window',
            'delivery_notes', 'tracking_number', 'condition_on_arrival',
            'issue_state', 'issue_type', 'issue_description', 'replacement_requested',
            'replacement_approved', 'replacement_eta', 'replacement_of',
            'image_url', 'image_file', 'thumbnail_url', 'gallery_images', 'attachments', 
            'import_row_number', 'import_data', 'notes', 'manual_notes', 'ai_summary_notes',
            'status_tags', 'delivery_status_tags', 'created_by', 'created_at', 'updated_at',
            # Frontend compatibility fields (camelCase)
            'imageUrl', 'vendorLink', 'unitPrice', 'expectedDeliveryDate', 'actualDeliveryDate',
            'paymentAmount', 'paidAmount', 'paymentStatus', 'paymentDueDate', 'issueState',
            'orderedOn', 'deliveryAddress', 'deliveryCity', 'statusTags', 'deliveryStatusTags'
        ]
        read_only_fields = ['created_at', 'updated_at', 'total_amount', 'outstanding_balance']


class ProductCategorySerializer(serializers.ModelSerializer):
    """
    Serializer for ProductCategory model
    """
    product_count = serializers.IntegerField(read_only=True)
    apartment_name = serializers.CharField(source='apartment.name', read_only=True)
    
    class Meta:
        model = ProductCategory
        fields = [
            'id', 'name', 'apartment', 'apartment_name', 'import_file_name', 
            'import_date', 'sheet_name', 'description', 'room_type', 
            'priority', 'is_active', 'product_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'import_date']


class ImportSessionSerializer(serializers.ModelSerializer):
    """
    Serializer for ImportSession model
    """
    apartment_name = serializers.CharField(source='apartment.name', read_only=True)
    duration = serializers.SerializerMethodField()
    
    def get_duration(self, obj):
        """Calculate import duration"""
        if obj.completed_at and obj.started_at:
            delta = obj.completed_at - obj.started_at
            return delta.total_seconds()
        return None
    
    class Meta:
        model = ImportSession
        fields = [
            'id', 'apartment', 'apartment_name', 'file_name', 'file_size', 
            'file_type', 'total_sheets', 'total_products', 'successful_imports', 
            'failed_imports', 'status', 'error_log', 'started_at', 
            'completed_at', 'duration'
        ]
        read_only_fields = ['started_at', 'completed_at']


class ProductImportSerializer(serializers.Serializer):
    """
    Serializer for product import requests
    """
    apartment_id = serializers.UUIDField()
    file = serializers.FileField()
    
    def validate_file(self, value):
        """Validate uploaded file"""
        # Check file extension
        allowed_extensions = ['.xlsx', '.xls', '.csv']
        file_ext = value.name.lower().split('.')[-1]
        if f'.{file_ext}' not in allowed_extensions:
            raise serializers.ValidationError(
                f"Unsupported file format. Allowed: {', '.join(allowed_extensions)}"
            )
        
        # Check file size (50MB)
        if value.size > 50 * 1024 * 1024:
            raise serializers.ValidationError("File size exceeds 50MB limit")
        
        return value
