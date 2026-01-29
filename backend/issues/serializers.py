from rest_framework import serializers
from .models import Issue, IssueItem, IssuePhoto, AICommunicationLog
from apartments.serializers import ApartmentSerializer
from products.serializers import ProductSerializer
from vendors.serializers import VendorSerializer
from orders.serializers import OrderSerializer, OrderItemSerializer


class IssueItemSerializer(serializers.ModelSerializer):
    """Serializer for individual products within an issue"""
    product_image = serializers.SerializerMethodField()
    order_item_product_name = serializers.CharField(source='order_item.product_name', read_only=True)
    
    class Meta:
        model = IssueItem
        fields = [
            'id', 'order_item', 'product', 'product_name', 'order_item_product_name',
            'quantity_affected', 'issue_types', 'description', 'product_image', 'created_at'
        ]
        read_only_fields = ['created_at']
    
    def _get_full_image_url(self, image_path):
        """Convert relative image path to full URL"""
        if not image_path:
            return None
            
        # Skip invalid URLs
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
            return f"http://localhost:8000{image_path}"
        
        # If it's just a filename or relative path, prepend /media/
        if not image_path.startswith('/'):
            image_path = f"/media/{image_path}"
        
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(image_path)
        return f"http://localhost:8000{image_path}"
    
    def _get_image_from_product(self, product_obj):
        """Helper to get image URL from a Product object"""
        if not product_obj:
            return None
        if product_obj.product_image:
            return self._get_full_image_url(product_obj.product_image)
        if product_obj.image_url:
            return self._get_full_image_url(product_obj.image_url)
        if product_obj.image_file:
            return self._get_full_image_url(product_obj.image_file.url)
        return None
    
    def get_product_image(self, obj):
        """Get product image URL with absolute path"""
        from products.models import Product
        from orders.models import OrderItem
        
        # First check order_item's stored image URL
        if obj.order_item and obj.order_item.product_image_url:
            return self._get_full_image_url(obj.order_item.product_image_url)
        
        # Check order_item's linked product
        if obj.order_item and obj.order_item.product:
            image = self._get_image_from_product(obj.order_item.product)
            if image:
                return image
        
        # Check directly linked product
        if obj.product:
            image = self._get_image_from_product(obj.product)
            if image:
                return image
        
        # Try to find product by exact name match first
        if obj.product_name:
            try:
                # Exact match
                matched_product = Product.objects.filter(product__iexact=obj.product_name).first()
                if matched_product:
                    image = self._get_image_from_product(matched_product)
                    if image:
                        return image
                
                # Contains match
                matched_product = Product.objects.filter(product__icontains=obj.product_name).first()
                if matched_product:
                    image = self._get_image_from_product(matched_product)
                    if image:
                        return image
                
                # Reverse contains - product name contains our search term
                for product in Product.objects.all()[:100]:  # Limit to avoid performance issues
                    if product.product and obj.product_name.lower() in product.product.lower():
                        image = self._get_image_from_product(product)
                        if image:
                            return image
            except Exception:
                pass
        
        # Try to find order item by product name and get its image
        if obj.product_name:
            try:
                order_item = OrderItem.objects.filter(product_name__icontains=obj.product_name).first()
                if order_item:
                    if order_item.product_image_url:
                        return self._get_full_image_url(order_item.product_image_url)
                    if order_item.product:
                        image = self._get_image_from_product(order_item.product)
                        if image:
                            return image
            except Exception:
                pass
        
        return None


class IssueItemCreateSerializer(serializers.Serializer):
    """Serializer for creating issue items in bulk"""
    order_item = serializers.UUIDField(required=False, allow_null=True)
    product = serializers.UUIDField(required=False, allow_null=True)
    product_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    quantity_affected = serializers.IntegerField(default=1, min_value=1)
    issue_types = serializers.CharField(max_length=500, required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)


class IssuePhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = IssuePhoto
        fields = ['id', 'url', 'uploaded_at']
        read_only_fields = ['uploaded_at']


class AICommunicationLogSerializer(serializers.ModelSerializer):
    approved_by_username = serializers.CharField(source='approved_by.username', read_only=True)
    issue_title = serializers.CharField(source='issue.type', read_only=True)
    
    class Meta:
        model = AICommunicationLog
        fields = '__all__'
        read_only_fields = ['timestamp']


class IssueListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views - much faster loading"""
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    apartment_name = serializers.CharField(source='apartment.name', read_only=True)
    display_product_name = serializers.SerializerMethodField()
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Issue
        fields = [
            'id', 'type', 'description', 'status', 'priority', 'resolution_status',
            'vendor', 'vendor_name', 'apartment', 'apartment_name',
            'display_product_name', 'items_count', 'ai_activated',
            'created_at', 'reported_on'
        ]
    
    def get_display_product_name(self, obj):
        # Use prefetched items if available
        if hasattr(obj, '_prefetched_objects_cache') and 'items' in obj._prefetched_objects_cache:
            items = obj._prefetched_objects_cache['items']
            if items:
                if len(items) == 1:
                    return items[0].product_name or obj.get_product_name()
                return f"{items[0].product_name or 'Multiple Products'} (+{len(items) - 1} more)"
        return obj.get_product_name()
    
    def get_items_count(self, obj):
        if hasattr(obj, '_prefetched_objects_cache') and 'items' in obj._prefetched_objects_cache:
            return len(obj._prefetched_objects_cache['items'])
        return 0


class IssueSerializer(serializers.ModelSerializer):
    apartment_details = ApartmentSerializer(source='apartment', read_only=True)
    product_details = ProductSerializer(source='product', read_only=True)
    vendor_details = VendorSerializer(source='vendor', read_only=True)
    order_details = OrderSerializer(source='order', read_only=True)
    order_item_details = OrderItemSerializer(source='order_item', read_only=True)
    display_product_name = serializers.SerializerMethodField()
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    photos = IssuePhotoSerializer(many=True, read_only=True)
    ai_communication_log = AICommunicationLogSerializer(many=True, read_only=True)
    # New: Multiple items per issue - use SerializerMethodField to ensure context is passed
    items = serializers.SerializerMethodField()
    items_data = IssueItemCreateSerializer(many=True, write_only=True, required=False)
    items_count = serializers.SerializerMethodField()
    
    def get_items(self, obj):
        """Get items with proper context for image URL building"""
        if hasattr(obj, 'items'):
            items = obj.items.all()
            return IssueItemSerializer(items, many=True, context=self.context).data
        return []
    
    class Meta:
        model = Issue
        fields = [
            'id', 'apartment', 'apartment_details', 'product', 'product_details', 
            'order', 'order_details', 'order_item', 'order_item_details',
            'product_name', 'display_product_name', 'vendor', 'vendor_details', 'vendor_name', 'type', 
            'description', 'reported_on', 'status', 'priority', 'expected_resolution', 
            'vendor_contact', 'impact', 'replacement_eta', 'ai_activated', 
            'resolution_status', 'resolution_type', 'resolution_notes',
            'delivery_date', 'invoice_number', 'tracking_number', 'auto_notify_vendor',
            'vendor_last_replied_at', 'first_sent_at', 'followup_count', 'sla_response_hours',
            'last_summary', 'last_summary_at', 'next_action',
            'photos', 'ai_communication_log', 'items', 'items_data', 'items_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['reported_on', 'created_at', 'updated_at']
        extra_kwargs = {
            'product': {'required': False, 'allow_null': True},
            'order': {'required': False, 'allow_null': True},
            'order_item': {'required': False, 'allow_null': True},
            'product_name': {'required': False, 'allow_blank': True},
            'resolution_type': {'required': False, 'allow_blank': True},
            'resolution_notes': {'required': False, 'allow_blank': True},
            'delivery_date': {'required': False, 'allow_null': True},
            'invoice_number': {'required': False, 'allow_blank': True},
            'tracking_number': {'required': False, 'allow_blank': True},
            'type': {'required': False, 'allow_blank': True},
            'description': {'required': False, 'allow_blank': True},
        }
    
    def get_display_product_name(self, obj):
        # If issue has items, show first item name or count
        if hasattr(obj, 'items') and obj.items.exists():
            items = obj.items.all()
            if items.count() == 1:
                return items.first().product_name or obj.get_product_name()
            return f"{items.first().product_name or 'Multiple Products'} (+{items.count() - 1} more)"
        return obj.get_product_name()
    
    def get_items_count(self, obj):
        if hasattr(obj, 'items'):
            return obj.items.count()
        return 0
    
    def create(self, validated_data):
        items_data = validated_data.pop('items_data', [])
        issue = super().create(validated_data)
        
        # Create issue items if provided
        for item_data in items_data:
            IssueItem.objects.create(
                issue=issue,
                order_item_id=item_data.get('order_item'),
                product_id=item_data.get('product'),
                product_name=item_data.get('product_name', ''),
                quantity_affected=item_data.get('quantity_affected', 1),
                issue_types=item_data.get('issue_types', ''),
                description=item_data.get('description', ''),
            )
        
        return issue
