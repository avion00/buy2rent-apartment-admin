from rest_framework import serializers
from .models import Payment, PaymentHistory
from apartments.serializers import ApartmentSerializer
from vendors.serializers import VendorSerializer


class PaymentHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentHistory
        fields = ['id', 'date', 'amount', 'method', 'reference_no', 'note', 'created_at']
        read_only_fields = ['created_at']


class ProductSummarySerializer(serializers.Serializer):
    """Lightweight product serializer for payment product list"""
    id = serializers.UUIDField()
    product = serializers.CharField()
    category_name = serializers.SerializerMethodField()
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    qty = serializers.IntegerField()
    payment_status = serializers.CharField()
    
    def get_category_name(self, obj):
        """Get category name from related ProductCategory"""
        if obj.category:
            return obj.category.name
        return None


class PaymentSerializer(serializers.ModelSerializer):
    apartment_details = ApartmentSerializer(source='apartment', read_only=True)
    vendor_details = VendorSerializer(source='vendor', read_only=True)
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    outstanding_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    payment_history = PaymentHistorySerializer(many=True, read_only=True)
    product_details = ProductSummarySerializer(source='products', many=True, read_only=True)
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = [
            'id', 'apartment', 'apartment_details', 'vendor', 'vendor_details', 
            'vendor_name', 'order_reference', 'total_amount', 'amount_paid', 
            'outstanding_amount', 'due_date', 'status', 'last_payment_date', 
            'notes', 'products', 'product_details', 'product_count',
            'payment_history', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_product_count(self, obj):
        """Return count of products in this payment"""
        return obj.products.count()
    
    def create(self, validated_data):
        """Handle products field during creation"""
        products_data = validated_data.pop('products', [])
        payment = Payment.objects.create(**validated_data)
        
        if products_data:
            payment.products.set(products_data)
        
        return payment
    
    def update(self, instance, validated_data):
        """Handle products field during update"""
        products_data = validated_data.pop('products', None)
        
        # Update payment fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update products if provided
        if products_data is not None:
            instance.products.set(products_data)
        
        return instance
