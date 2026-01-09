from rest_framework import serializers
from .models import Vendor


class VendorSerializer(serializers.ModelSerializer):
    # Dynamic counts from related models
    orders_count = serializers.SerializerMethodField()
    active_issues = serializers.SerializerMethodField()
    
    def validate_website(self, value):
        """
        Normalize website URL by adding https:// if protocol is missing.
        Accepts formats like: www.example.com, example.com, https://example.com
        """
        if value and value.strip():
            value = value.strip()
            # Check if protocol is missing
            if not value.startswith(('http://', 'https://')):
                value = f'https://{value}'
        return value
    
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
    
    def get_orders_count(self, obj):
        """Get actual count of orders for this vendor"""
        return obj.orders.count()
    
    def get_active_issues(self, obj):
        """Get count of open/active issues for this vendor"""
        return obj.issues.exclude(status='Closed').count()


class VendorListSerializer(serializers.ModelSerializer):
    """Simplified serializer for vendor list views"""
    contact = serializers.SerializerMethodField()
    orders_count = serializers.SerializerMethodField()
    active_issues = serializers.SerializerMethodField()
    
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
    
    def get_orders_count(self, obj):
        """Get actual count of orders for this vendor"""
        return obj.orders.count()
    
    def get_active_issues(self, obj):
        """Get count of open/active issues for this vendor"""
        return obj.issues.exclude(status='Closed').count()
