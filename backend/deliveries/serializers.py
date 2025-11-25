from rest_framework import serializers
from .models import Delivery
from apartments.serializers import ApartmentSerializer
from vendors.serializers import VendorSerializer


class DeliverySerializer(serializers.ModelSerializer):
    apartment_details = ApartmentSerializer(source='apartment', read_only=True)
    vendor_details = VendorSerializer(source='vendor', read_only=True)
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    
    class Meta:
        model = Delivery
        fields = [
            'id', 'apartment', 'apartment_details', 'vendor', 'vendor_details', 
            'vendor_name', 'order_reference', 'expected_date', 'actual_date', 
            'received_by', 'status', 'notes', 'proof_photos', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
