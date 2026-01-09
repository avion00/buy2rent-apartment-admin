from rest_framework import serializers
from .models import Product
from .category_models import ProductCategory, ImportSession
from apartments.serializers import ApartmentSerializer
from vendors.serializers import VendorSerializer


class ProductSerializer(serializers.ModelSerializer):
    apartment_details = ApartmentSerializer(source='apartment', read_only=True)
    vendor_details = VendorSerializer(source='vendor', read_only=True)
    vendor_name = serializers.SerializerMethodField()
    category_details = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    outstanding_balance = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    status = serializers.SerializerMethodField()
    delivery_status_tags = serializers.SerializerMethodField()
    order_status_info = serializers.ReadOnlyField()
    has_active_order = serializers.ReadOnlyField()
    is_ordered = serializers.ReadOnlyField()
    delivery_status_info = serializers.ReadOnlyField()
    combined_status_info = serializers.ReadOnlyField()
    payment_status_from_orders = serializers.ReadOnlyField()
    issue_status_info = serializers.ReadOnlyField()
    
    def get_vendor_name(self, obj):
        """Return vendor name or None if no vendor assigned"""
        return obj.vendor.name if obj.vendor else None
    
    def get_status(self, obj):
        """Ensure status is always returned as an array"""
        import json
        status_value = obj.status
        
        # If it's already a list, return it
        if isinstance(status_value, list):
            return status_value
        
        # If it's a JSON string, parse it
        if isinstance(status_value, str):
            try:
                parsed = json.loads(status_value)
                if isinstance(parsed, list):
                    return parsed
                return [parsed] if parsed else ['Design Approved']
            except:
                return [status_value] if status_value else ['Design Approved']
        
        # Default fallback
        return ['Design Approved']
    
    def get_delivery_status_tags(self, obj):
        """Ensure delivery_status_tags is always returned as an array"""
        import json
        tags_value = obj.delivery_status_tags
        
        # If it's already a list, return it
        if isinstance(tags_value, list):
            return tags_value
        
        # If it's a JSON string, parse it
        if isinstance(tags_value, str):
            try:
                parsed = json.loads(tags_value)
                if isinstance(parsed, list):
                    return parsed
                # If it's comma-separated string, split it
                return [tag.strip() for tag in tags_value.split(',') if tag.strip()]
            except:
                # If parsing fails, split by comma
                return [tag.strip() for tag in tags_value.split(',') if tag.strip()]
        
        # Default fallback
        return []
    
    # Enhanced product_image field that provides full URL
    product_image = serializers.SerializerMethodField()
    
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
    
    def get_product_image(self, obj):
        """
        Get full product image URL - unified method for all image sources.
        Priority: product_image > image_file > image_url (for backward compatibility)
        """
        # Priority 1: product_image field (primary)
        if obj.product_image:
            return self._get_full_image_url(obj.product_image)
        
        # Priority 2: image_file (for backward compatibility with uploaded files)
        if obj.image_file:
            try:
                return self._get_full_image_url(obj.image_file.url)
            except:
                pass
        
        # Priority 3: image_url (for backward compatibility)
        if obj.image_url:
            return self._get_full_image_url(obj.image_url)
        
        return None
    
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
    
    def update(self, instance, validated_data):
        """Override update to handle status and delivery_status_tags fields (which are SerializerMethodFields)"""
        import logging
        logger = logging.getLogger(__name__)
        
        # Extract status and delivery_status_tags from initial_data since they're not in validated_data
        status = self.initial_data.get('status')
        delivery_status_tags = self.initial_data.get('delivery_status_tags')
        
        logger.info(f"Updating product {instance.id} with status: {status}, delivery_status_tags: {delivery_status_tags}")
        
        # Update all validated fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Handle status separately - always update if present in request
        if status is not None:
            if isinstance(status, list):
                instance.status = status if status else []
                logger.info(f"Set status to list: {instance.status}")
            elif isinstance(status, str):
                instance.status = [status] if status else []
                logger.info(f"Set status from string: {instance.status}")
            else:
                instance.status = []
                logger.info(f"Set status to empty array")
        
        # Handle delivery_status_tags separately
        if delivery_status_tags is not None:
            if isinstance(delivery_status_tags, list):
                instance.delivery_status_tags = delivery_status_tags if delivery_status_tags else []
                logger.info(f"Set delivery_status_tags to list: {instance.delivery_status_tags}")
            elif isinstance(delivery_status_tags, str):
                instance.delivery_status_tags = [delivery_status_tags] if delivery_status_tags else []
                logger.info(f"Set delivery_status_tags from string: {instance.delivery_status_tags}")
            else:
                instance.delivery_status_tags = []
                logger.info(f"Set delivery_status_tags to empty array")
        
        instance.save()
        logger.info(f"Product saved with status: {instance.status}, delivery_status_tags: {instance.delivery_status_tags}")
        return instance
    
    def create(self, validated_data):
        """Override create to handle status and delivery_status_tags fields"""
        # Extract status and delivery_status_tags from initial_data
        status = self.initial_data.get('status')
        delivery_status_tags = self.initial_data.get('delivery_status_tags')
        
        # Create the product
        product = Product.objects.create(**validated_data)
        
        # Set status
        if status is not None:
            if isinstance(status, list):
                product.status = status
            elif isinstance(status, str):
                product.status = [status] if status else ['Design Approved']
            else:
                product.status = ['Design Approved']
        else:
            product.status = ['Design Approved']
        
        # Set delivery_status_tags
        if delivery_status_tags is not None:
            if isinstance(delivery_status_tags, list):
                product.delivery_status_tags = delivery_status_tags
            elif isinstance(delivery_status_tags, str):
                product.delivery_status_tags = [delivery_status_tags] if delivery_status_tags else []
            else:
                product.delivery_status_tags = []
        else:
            product.delivery_status_tags = []
        
        product.save()
        return product
    
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
            'delivery_type', 'delivery_status_tags', 'delivery_address', 'delivery_city', 
            'delivery_postal_code', 'delivery_country', 'delivery_instructions', 
            'delivery_contact_person', 'delivery_contact_phone', 'delivery_contact_email', 
            'delivery_time_window', 'delivery_notes', 'tracking_number', 'condition_on_arrival',
            # Delivery - Sender/Recipient
            'sender', 'sender_address', 'sender_phone',
            'recipient', 'recipient_address', 'recipient_phone', 'recipient_email',
            # Delivery - Type Specific
            'locker_provider', 'locker_id', 'pickup_provider', 'pickup_location',
            'customs_description', 'item_value', 'hs_category',
            # Delivery - Additional Options
            'insurance', 'cod', 'pickup_time', 'delivery_deadline', 'special_instructions',
            'issue_state', 'issue_type', 'issue_description', 'replacement_requested',
            'replacement_approved', 'replacement_eta', 'replacement_of',
            'image_url', 'image_file', 'thumbnail_url', 'gallery_images', 'attachments', 
            'import_row_number', 'import_data', 'notes', 'manual_notes', 'ai_summary_notes',
            'created_by', 'created_at', 'updated_at',
            # Order and delivery tracking
            'order_status_info', 'has_active_order', 'is_ordered', 'delivery_status_info', 'combined_status_info', 'payment_status_from_orders'
        ]
        read_only_fields = ['created_at', 'updated_at', 'total_amount', 'outstanding_balance', 
                           'order_status_info', 'has_active_order', 'is_ordered', 'delivery_status_info', 'combined_status_info', 'payment_status_from_orders']


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
    uploaded_file_url = serializers.SerializerMethodField()
    
    def get_duration(self, obj):
        """Calculate import duration"""
        if obj.completed_at and obj.started_at:
            delta = obj.completed_at - obj.started_at
            return delta.total_seconds()
        return None
    
    def get_uploaded_file_url(self, obj):
        """Get the URL of the uploaded file"""
        if obj.uploaded_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.uploaded_file.url)
            return obj.uploaded_file.url
        return None
    
    class Meta:
        model = ImportSession
        fields = [
            'id', 'apartment', 'apartment_name', 'file_name', 'file_size', 
            'file_type', 'uploaded_file', 'uploaded_file_url', 'total_sheets', 
            'total_products', 'successful_imports', 'failed_imports', 'status', 
            'error_log', 'started_at', 'completed_at', 'duration'
        ]
        read_only_fields = ['started_at', 'completed_at', 'uploaded_file_url']


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
