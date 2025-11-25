"""
Specialized serializers for VendorView frontend page
These serializers provide data in the exact format expected by the VendorView.tsx component
"""
from rest_framework import serializers
from .models import Vendor


class VendorViewProductSerializer(serializers.Serializer):
    """Serializer for products in vendor view - matches frontend expectations"""
    id = serializers.CharField()
    product = serializers.CharField()
    apartment = serializers.CharField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    qty = serializers.IntegerField()
    availability = serializers.CharField()
    status = serializers.CharField()


class VendorViewOrderSerializer(serializers.Serializer):
    """Serializer for orders in vendor view - matches frontend expectations"""
    id = serializers.CharField()
    po_number = serializers.CharField()
    apartment = serializers.CharField()
    items_count = serializers.IntegerField()
    total = serializers.DecimalField(max_digits=12, decimal_places=2)
    status = serializers.CharField()
    placed_on = serializers.DateField()


class VendorViewIssueSerializer(serializers.Serializer):
    """Serializer for issues in vendor view - matches frontend expectations"""
    id = serializers.CharField()
    item = serializers.CharField()
    issue_type = serializers.CharField()
    description = serializers.CharField()
    priority = serializers.CharField()
    status = serializers.CharField()
    created_date = serializers.DateField()


class VendorViewPaymentSerializer(serializers.Serializer):
    """Serializer for payments in vendor view - matches frontend expectations"""
    id = serializers.CharField()
    order_no = serializers.CharField()
    apartment = serializers.CharField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    status = serializers.CharField()
    due_date = serializers.DateField()
    paid_date = serializers.DateField(allow_null=True)


class VendorViewDetailSerializer(serializers.ModelSerializer):
    """
    Complete vendor detail serializer for VendorView frontend
    Includes all data needed for the vendor detail page
    """
    
    # Core vendor info (matching frontend expectations)
    contact = serializers.SerializerMethodField()
    
    # Related data
    products = serializers.SerializerMethodField()
    orders = serializers.SerializerMethodField()
    issues = serializers.SerializerMethodField()
    payments = serializers.SerializerMethodField()
    
    # Statistics
    products_count = serializers.SerializerMethodField()
    orders_total_value = serializers.SerializerMethodField()
    
    class Meta:
        model = Vendor
        fields = [
            # Core vendor fields
            'id', 'name', 'logo', 'contact', 'website', 'lead_time', 
            'reliability', 'orders_count', 'active_issues',
            
            # Address and business info
            'address', 'city', 'country', 'postal_code',
            'company_name', 'contact_person', 'email', 'phone',
            'business_type', 'year_established', 'employee_count',
            
            # Related data
            'products', 'orders', 'issues', 'payments',
            
            # Computed fields
            'products_count', 'orders_total_value',
            
            # Metadata
            'created_at', 'updated_at'
        ]
    
    def get_contact(self, obj):
        """Return primary contact info"""
        return obj.email or obj.contact_person or obj.phone or 'No contact info'
    
    def get_products(self, obj):
        """Get vendor products in frontend format"""
        products = obj.products.select_related('apartment').all()[:50]  # Limit for performance
        return [
            {
                'id': str(product.id),
                'product': product.product,
                'apartment': product.apartment.name if product.apartment else 'N/A',
                'price': float(product.unit_price),
                'qty': product.qty,
                'availability': product.availability.replace(' ', '_').lower(),
                'status': product.status.lower()
            }
            for product in products
        ]
    
    def get_orders(self, obj):
        """Get vendor orders in frontend format"""
        orders = obj.orders.select_related('apartment').all()[:50]  # Limit for performance
        return [
            {
                'id': str(order.id),
                'po_number': order.po_number,
                'apartment': order.apartment.name if order.apartment else 'N/A',
                'items_count': order.items_count,
                'total': float(order.total),
                'status': order.status,
                'placed_on': order.placed_on.strftime('%Y-%m-%d')
            }
            for order in orders
        ]
    
    def get_issues(self, obj):
        """Get vendor issues in frontend format"""
        issues = obj.issues.select_related('apartment', 'product').all()[:50]  # Limit for performance
        return [
            {
                'id': str(issue.id),
                'item': issue.product.product if issue.product else 'N/A',
                'issue_type': issue.type.replace(' ', '_').lower(),
                'description': issue.description,
                'priority': issue.priority.lower(),
                'status': issue.status.replace(' ', '_').lower(),
                'created_date': issue.created_at.date().strftime('%Y-%m-%d')
            }
            for issue in issues
        ]
    
    def get_payments(self, obj):
        """Get vendor payments in frontend format"""
        payments = obj.payments.select_related('apartment').all()[:50]  # Limit for performance
        return [
            {
                'id': str(payment.id),
                'order_no': payment.order_reference,
                'apartment': payment.apartment.name if payment.apartment else 'N/A',
                'amount': float(payment.total_amount),
                'status': payment.status.lower(),
                'due_date': payment.due_date.strftime('%Y-%m-%d'),
                'paid_date': payment.last_payment_date.strftime('%Y-%m-%d') if payment.last_payment_date else None
            }
            for payment in payments
        ]
    
    def get_products_count(self, obj):
        """Get total products count"""
        return obj.products.count()
    
    def get_orders_total_value(self, obj):
        """Get total value of all orders"""
        from django.db.models import Sum
        total = obj.orders.aggregate(total=Sum('total'))['total']
        return float(total) if total else 0.0
