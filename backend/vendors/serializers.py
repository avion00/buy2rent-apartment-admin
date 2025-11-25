from rest_framework import serializers
from .models import Vendor


class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = [
            'id',
            # Core identity/contact
            'name', 'company_name', 'contact_person', 'email', 'phone', 'website',

            # Extended profile / dashboard fields
            'logo', 'lead_time', 'reliability', 'orders_count', 'active_issues',

            # Address information
            'address', 'city', 'country', 'postal_code',

            # Business information
            'tax_id', 'business_type', 'year_established', 'employee_count',

            # Classification & offerings
            'category', 'product_categories', 'certifications', 'specializations',

            # Terms & conditions
            'payment_terms', 'delivery_terms', 'warranty_period', 'return_policy', 'minimum_order',

            # Additional notes & metadata
            'notes', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class VendorDetailSerializer(VendorSerializer):
    """Extended serializer for detailed vendor view with additional computed fields"""
    
    # Computed fields for frontend compatibility
    contact = serializers.SerializerMethodField()
    products_count = serializers.SerializerMethodField()
    total_order_value = serializers.SerializerMethodField()
    
    class Meta(VendorSerializer.Meta):
        fields = VendorSerializer.Meta.fields + [
            'contact', 'products_count', 'total_order_value'
        ]
    
    def get_contact(self, obj):
        """Return primary contact (email or contact_person)"""
        return obj.email or obj.contact_person or 'No contact info'
    
    def get_products_count(self, obj):
        """Return count of products for this vendor"""
        return obj.products.count()
    
    def get_total_order_value(self, obj):
        """Return total value of all orders for this vendor"""
        from django.db.models import Sum
        total = obj.orders.aggregate(total=Sum('total'))['total']
        return float(total) if total else 0.0


class VendorListSerializer(serializers.ModelSerializer):
    """Simplified serializer for vendor list views"""
    contact = serializers.SerializerMethodField()
    
    class Meta:
        model = Vendor
        fields = [
            'id', 'name', 'company_name', 'contact', 'email', 'phone', 'website',
            'logo', 'lead_time', 'reliability', 'orders_count', 'active_issues',
            'created_at'
        ]
    
    def get_contact(self, obj):
        """Return primary contact (email or contact_person)"""
        return obj.email or obj.contact_person or 'No contact info'
