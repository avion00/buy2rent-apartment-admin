from rest_framework import serializers
from .models import Payment, PaymentHistory
from apartments.serializers import ApartmentSerializer
from vendors.serializers import VendorSerializer


class PaymentHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentHistory
        fields = ['id', 'date', 'amount', 'method', 'reference_no', 'note', 'created_at']
        read_only_fields = ['created_at']


class PaymentSerializer(serializers.ModelSerializer):
    apartment_details = ApartmentSerializer(source='apartment', read_only=True)
    vendor_details = VendorSerializer(source='vendor', read_only=True)
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    outstanding_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    payment_history = PaymentHistorySerializer(many=True, read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'apartment', 'apartment_details', 'vendor', 'vendor_details', 
            'vendor_name', 'order_reference', 'total_amount', 'amount_paid', 
            'outstanding_amount', 'due_date', 'status', 'last_payment_date', 
            'notes', 'payment_history', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
