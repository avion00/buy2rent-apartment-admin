from rest_framework import serializers
from .models import Order, OrderItem
from products.models import Product


class OrderItemSerializer(serializers.ModelSerializer):
    product_image = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'product_image', 'product_image_url', 'sku', 'quantity', 'unit_price', 'total_price',
            'description', 'specifications', 'created_at', 'updated_at'
        ]
        read_only_fields = ['total_price', 'created_at', 'updated_at']
    
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
    
    def _get_image_from_product(self, product_obj):
        """Helper to get image URL from a Product object"""
        if not product_obj:
            return None
        # Check product_image field first (URL from Excel import)
        if product_obj.product_image:
            return self._get_full_image_url(product_obj.product_image)
        # Then check image_url field
        if product_obj.image_url:
            return self._get_full_image_url(product_obj.image_url)
        # Then check image_file field
        if product_obj.image_file:
            return self._get_full_image_url(product_obj.image_file.url)
        return None
    
    def get_product_image(self, obj):
        # First check if image URL is stored directly on the order item
        if obj.product_image_url:
            return obj.product_image_url
        
        # Try to get image from linked product FK
        if obj.product:
            image = self._get_image_from_product(obj.product)
            if image:
                return image
        
        # If no linked product, try to find product by SKU first (more reliable)
        if obj.sku:
            try:
                matched_product = Product.objects.filter(sku__iexact=obj.sku).first()
                if matched_product:
                    image = self._get_image_from_product(matched_product)
                    if image:
                        return image
            except Exception:
                pass
        
        # Try to find product by name match
        if obj.product_name:
            try:
                # Try exact match first
                matched_product = Product.objects.filter(product__iexact=obj.product_name).first()
                if matched_product:
                    image = self._get_image_from_product(matched_product)
                    if image:
                        return image
                
                # Try contains match - check if product name contains the order item name
                matched_product = Product.objects.filter(product__icontains=obj.product_name).first()
                if matched_product:
                    image = self._get_image_from_product(matched_product)
                    if image:
                        return image
                
                # Try reverse contains - check if order item name contains the product name
                for product in Product.objects.exclude(product_image='').exclude(image_url='')[:100]:
                    if product.product and product.product.lower() in obj.product_name.lower():
                        image = self._get_image_from_product(product)
                        if image:
                            return image
            except Exception:
                pass
        
        return None


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, required=False)
    apartment_name = serializers.CharField(source='apartment.name', read_only=True)
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    is_delivered = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'po_number', 'apartment', 'apartment_name', 'vendor', 'vendor_name',
            'items_count', 'total', 'status', 'confirmation_code', 'placed_on', 'expected_delivery', 
            'actual_delivery', 'notes', 'shipping_address', 'tracking_number',
            'is_delivered', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        order = Order.objects.create(**validated_data)
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        return order
    
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        
        # Update order fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update items if provided
        if items_data is not None:
            # Delete existing items
            instance.items.all().delete()
            # Create new items
            for item_data in items_data:
                OrderItem.objects.create(order=instance, **item_data)
        
        return instance


class OrderListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list views"""
    apartment_name = serializers.CharField(source='apartment.name', read_only=True)
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    is_delivered = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'po_number', 'apartment_name', 'vendor_name',
            'items_count', 'total', 'status', 'confirmation_code', 'placed_on', 'expected_delivery', 
            'actual_delivery', 'tracking_number', 'is_delivered'
        ]
