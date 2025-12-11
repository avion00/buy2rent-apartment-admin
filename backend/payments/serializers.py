from rest_framework import serializers
from .models import Payment, PaymentHistory
from apartments.serializers import ApartmentSerializer
from vendors.serializers import VendorSerializer
from orders.models import Order, OrderItem


class PaymentHistorySerializer(serializers.ModelSerializer):
    payment_reference = serializers.CharField(source='payment.order_reference', read_only=True)
    
    class Meta:
        model = PaymentHistory
        fields = ['id', 'payment', 'payment_reference', 'date', 'amount', 'method', 'reference_no', 'note', 'created_at']
        read_only_fields = ['created_at']


class PaymentHistoryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating payment history entries"""
    class Meta:
        model = PaymentHistory
        fields = ['payment', 'date', 'amount', 'method', 'reference_no', 'note']


class OrderItemSummarySerializer(serializers.ModelSerializer):
    """Lightweight order item serializer for payment"""
    product_image = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_image', 'sku', 
                  'quantity', 'unit_price', 'total_price']
    
    def get_product_image(self, obj):
        """Get product image URL"""
        if obj.product_image_url:
            return obj.product_image_url
        if obj.product and obj.product.product_image:
            return obj.product.product_image
        return None


class OrderSummarySerializer(serializers.ModelSerializer):
    """Lightweight order serializer for payment"""
    apartment_name = serializers.CharField(source='apartment.name', read_only=True)
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'po_number', 'apartment_name', 'vendor_name', 
                  'items_count', 'total', 'status', 'placed_on']


class ProductSummarySerializer(serializers.Serializer):
    """Lightweight product serializer for payment product list (legacy)"""
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
    # Related object details
    apartment_details = ApartmentSerializer(source='apartment', read_only=True)
    vendor_details = VendorSerializer(source='vendor', read_only=True)
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    order_details = OrderSummarySerializer(source='order', read_only=True)
    
    # Calculated fields
    final_total = serializers.IntegerField(read_only=True)
    outstanding_amount = serializers.IntegerField(read_only=True)
    
    # Related collections
    payment_history = PaymentHistorySerializer(many=True, read_only=True)
    order_item_details = OrderItemSummarySerializer(source='order_items', many=True, read_only=True)
    product_details = ProductSummarySerializer(source='products', many=True, read_only=True)
    
    # Counts
    product_count = serializers.SerializerMethodField()
    order_items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'order_details', 'apartment', 'apartment_details', 
            'vendor', 'vendor_details', 'vendor_name', 'order_reference', 
            # Amount fields
            'total_amount', 'shipping_cost', 'discount', 'final_total',
            'amount_paid', 'outstanding_amount',
            # Payment details
            'due_date', 'status', 'last_payment_date', 'notes',
            'payment_method', 'reference_number',
            # Bank Transfer details
            'bank_name', 'account_holder', 'account_number', 'iban',
            # Card Payment details
            'card_holder', 'card_last_four',
            # Related items
            'order_items', 'order_item_details', 'order_items_count',
            'products', 'product_details', 'product_count',
            'payment_history', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'status']
    
    def get_product_count(self, obj):
        """Return count of products in this payment"""
        return obj.products.count()
    
    def get_order_items_count(self, obj):
        """Return count of order items in this payment"""
        return obj.order_items.count()
    
    def create(self, validated_data):
        """Handle order_items and products during creation"""
        order_items_data = validated_data.pop('order_items', [])
        products_data = validated_data.pop('products', [])
        order = validated_data.get('order')
        
        # If order is provided, auto-populate apartment, vendor, order_reference
        if order:
            validated_data['apartment'] = order.apartment
            validated_data['vendor'] = order.vendor
            validated_data['order_reference'] = order.po_number
        
        payment = Payment.objects.create(**validated_data)
        
        # Set order items
        if order_items_data:
            payment.order_items.set(order_items_data)
        
        # Set products (legacy support)
        if products_data:
            payment.products.set(products_data)
        
        return payment
    
    def update(self, instance, validated_data):
        """Handle order_items and products during update"""
        order_items_data = validated_data.pop('order_items', None)
        products_data = validated_data.pop('products', None)
        
        # Update payment fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update order items if provided
        if order_items_data is not None:
            instance.order_items.set(order_items_data)
        
        # Update products if provided (legacy support)
        if products_data is not None:
            instance.products.set(products_data)
        
        return instance


class PaymentCreateFromOrderSerializer(serializers.Serializer):
    """Serializer for creating payment from an order"""
    order = serializers.PrimaryKeyRelatedField(queryset=Order.objects.all())
    order_items = serializers.PrimaryKeyRelatedField(
        queryset=OrderItem.objects.all(), 
        many=True,
        required=False
    )
    due_date = serializers.DateField()
    
    # Amount fields
    total_amount = serializers.IntegerField(required=False)
    shipping_cost = serializers.IntegerField(required=False, default=0)
    discount = serializers.IntegerField(required=False, default=0)
    amount_paid = serializers.IntegerField(required=False, default=0)
    
    # Payment method
    payment_method = serializers.ChoiceField(
        choices=['Bank Transfer', 'Card Payment', 'Cash'],
        default='Bank Transfer'
    )
    reference_number = serializers.CharField(required=False, allow_blank=True, default='')
    notes = serializers.CharField(required=False, allow_blank=True, default='')
    
    # Bank Transfer details
    bank_name = serializers.CharField(required=False, allow_blank=True, default='')
    account_holder = serializers.CharField(required=False, allow_blank=True, default='')
    account_number = serializers.CharField(required=False, allow_blank=True, default='')
    iban = serializers.CharField(required=False, allow_blank=True, default='')
    
    # Card Payment details
    card_holder = serializers.CharField(required=False, allow_blank=True, default='')
    card_last_four = serializers.CharField(required=False, allow_blank=True, default='')
    
    def create(self, validated_data):
        order = validated_data['order']
        order_items = validated_data.get('order_items', [])
        due_date = validated_data['due_date']
        
        # If no specific items selected, use all order items
        if not order_items:
            order_items = list(order.items.all())
        
        # Calculate total from selected order items if not provided
        total_amount = validated_data.get('total_amount')
        if total_amount is None:
            total_amount = int(sum(item.total_price for item in order_items))
        
        # Create payment
        payment = Payment.objects.create(
            order=order,
            apartment=order.apartment,
            vendor=order.vendor,
            order_reference=order.po_number,
            total_amount=total_amount,
            shipping_cost=validated_data.get('shipping_cost', 0),
            discount=validated_data.get('discount', 0),
            amount_paid=validated_data.get('amount_paid', 0),
            due_date=due_date,
            notes=validated_data.get('notes', ''),
            payment_method=validated_data.get('payment_method', 'Bank Transfer'),
            reference_number=validated_data.get('reference_number', ''),
            # Bank Transfer details
            bank_name=validated_data.get('bank_name', ''),
            account_holder=validated_data.get('account_holder', ''),
            account_number=validated_data.get('account_number', ''),
            iban=validated_data.get('iban', ''),
            # Card Payment details
            card_holder=validated_data.get('card_holder', ''),
            card_last_four=validated_data.get('card_last_four', ''),
        )
        
        # Link order items
        payment.order_items.set(order_items)
        
        return payment
