from rest_framework import serializers
from .models import Delivery, DeliveryStatusHistory
from apartments.serializers import ApartmentSerializer
from vendors.serializers import VendorSerializer
from orders.serializers import OrderItemSerializer


class DeliveryStatusHistorySerializer(serializers.ModelSerializer):
    """Serializer for delivery status history entries"""
    class Meta:
        model = DeliveryStatusHistory
        fields = [
            'id', 'status', 'notes', 'changed_by', 
            'received_by', 'location', 'delay_reason', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class DeliverySerializer(serializers.ModelSerializer):
    apartment_details = ApartmentSerializer(source='apartment', read_only=True)
    apartment_name = serializers.CharField(source='apartment.name', read_only=True)
    vendor_details = VendorSerializer(source='vendor', read_only=True)
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    time_slot = serializers.CharField(read_only=True)
    order_total = serializers.DecimalField(source='order.total', max_digits=12, decimal_places=2, read_only=True, allow_null=True)
    order_items_count = serializers.IntegerField(source='order.items_count', read_only=True, allow_null=True)
    order_items = serializers.SerializerMethodField()
    order_status = serializers.CharField(source='order.status', read_only=True, allow_null=True)
    order_shipping_address = serializers.CharField(source='order.shipping_address', read_only=True, allow_null=True)
    order_notes = serializers.CharField(source='order.notes', read_only=True, allow_null=True)
    status_history = DeliveryStatusHistorySerializer(many=True, read_only=True)
    
    class Meta:
        model = Delivery
        fields = [
            'id', 'order', 'apartment', 'apartment_details', 'apartment_name',
            'vendor', 'vendor_details', 'vendor_name', 'order_reference',
            'expected_date', 'actual_date', 'time_slot_start', 'time_slot_end', 'time_slot',
            'priority', 'tracking_number', 'received_by', 'status', 
            'notes', 'proof_photos', 'order_total', 'order_items_count',
            'order_items', 'order_status', 'order_shipping_address', 'order_notes',
            'status_history', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'time_slot']
    
    def get_order_items(self, obj):
        """Get order items if order exists"""
        if obj.order:
            return OrderItemSerializer(obj.order.items.all(), many=True).data
        return []


class DeliveryListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list views"""
    apartment_name = serializers.CharField(source='apartment.name', read_only=True)
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    time_slot = serializers.CharField(read_only=True)
    
    class Meta:
        model = Delivery
        fields = [
            'id', 'order', 'apartment_name', 'vendor_name', 'order_reference',
            'expected_date', 'time_slot', 'priority', 'tracking_number', 'status'
        ]
