from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product_name', 'sku', 'quantity', 'unit_price', 'total_price',
            'description', 'specifications', 'created_at', 'updated_at'
        ]
        read_only_fields = ['total_price', 'created_at', 'updated_at']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, required=False)
    apartment_name = serializers.CharField(source='apartment.name', read_only=True)
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    is_delivered = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'po_number', 'apartment', 'apartment_name', 'vendor', 'vendor_name',
            'items_count', 'total', 'status', 'placed_on', 'expected_delivery', 
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
            'items_count', 'total', 'status', 'placed_on', 'expected_delivery', 
            'actual_delivery', 'is_delivered'
        ]
