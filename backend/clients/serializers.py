from rest_framework import serializers
from .models import Client
from django.db.models import Sum, Count
from drf_spectacular.utils import extend_schema_field
from drf_spectacular.types import OpenApiTypes
from typing import Dict, Any


class ClientSerializer(serializers.ModelSerializer):
    apartments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Client
        fields = [
            'id', 'name', 'email', 'phone', 'account_status', 
            'type', 'notes', 'apartments_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'apartments_count']
    
    @extend_schema_field(OpenApiTypes.INT)
    def get_apartments_count(self, obj) -> int:
        """Get the number of apartments for this client"""
        # Use annotated value if available (from viewset optimization)
        if hasattr(obj, 'apartments_count_annotated'):
            return obj.apartments_count_annotated
        # Fallback to count query
        return obj.apartments.count()


class ClientDetailSerializer(serializers.ModelSerializer):
    """
    Detailed client serializer with apartments, products, and statistics
    """
    apartments = serializers.SerializerMethodField()
    products = serializers.SerializerMethodField()
    statistics = serializers.SerializerMethodField()
    
    class Meta:
        model = Client
        fields = [
            'id', 'name', 'email', 'phone', 'account_status', 
            'type', 'notes', 'created_at', 'updated_at',
            'apartments', 'products', 'statistics'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    @extend_schema_field(OpenApiTypes.OBJECT)
    def get_apartments(self, obj) -> Dict[str, Any]:
        """Get all apartments for this client"""
        from apartments.serializers import ApartmentSerializer
        apartments = obj.apartments.all()
        return {
            'count': apartments.count(),
            'data': ApartmentSerializer(apartments, many=True).data
        }
    
    @extend_schema_field(OpenApiTypes.OBJECT)
    def get_products(self, obj) -> Dict[str, Any]:
        """Get all products across all apartments for this client"""
        from products.serializers import ProductSerializer
        from products.models import Product
        from decimal import Decimal
        
        # Get all apartments for this client
        apartment_ids = obj.apartments.values_list('id', flat=True)
        
        # Get all products for these apartments
        products = Product.objects.filter(apartment_id__in=apartment_ids).select_related(
            'apartment', 'vendor'
        )
        
        # Calculate total value from unit_price * qty
        total_value = Decimal('0')
        for product in products:
            if product.unit_price:
                total_value += (product.unit_price * product.qty)
        
        return {
            'count': products.count(),
            'total_value': float(total_value),
            'data': ProductSerializer(products, many=True).data
        }
    
    @extend_schema_field(OpenApiTypes.OBJECT)
    def get_statistics(self, obj) -> Dict[str, Any]:
        """Get comprehensive statistics for this client"""
        from products.models import Product
        from decimal import Decimal
        
        # Get apartments
        apartments = obj.apartments.all()
        
        # Apartment statistics
        apartment_stats = {
            'total': apartments.count(),
            'by_status': {},
            'by_type': {}
        }
        
        for apt in apartments:
            status = apt.status
            apt_type = apt.type
            apartment_stats['by_status'][status] = apartment_stats['by_status'].get(status, 0) + 1
            apartment_stats['by_type'][apt_type] = apartment_stats['by_type'].get(apt_type, 0) + 1
        
        # Get all products for this client's apartments
        apartment_ids = apartments.values_list('id', flat=True)
        products = Product.objects.filter(apartment_id__in=apartment_ids)
        
        # Calculate total value from unit_price * qty
        total_value = Decimal('0')
        total_paid = Decimal('0')
        total_payable = Decimal('0')
        
        product_status_counts = {}
        
        for product in products:
            # Calculate value
            if product.unit_price:
                total_value += (product.unit_price * product.qty)
            
            # Sum paid and payable amounts (handle None values)
            if product.paid_amount:
                total_paid += product.paid_amount
            if product.payment_amount:
                total_payable += product.payment_amount
            
            # Count by status
            status = product.status
            product_status_counts[status] = product_status_counts.get(status, 0) + 1
        
        # Product statistics
        product_stats = {
            'total': products.count(),
            'total_value': float(total_value),
            'by_status': product_status_counts
        }
        
        # Financial statistics
        financial_stats = {
            'total_spent': float(total_value),
            'total_paid': float(total_paid),
            'outstanding': float(total_payable - total_paid)
        }
        
        return {
            'apartments': apartment_stats,
            'products': product_stats,
            'financial': financial_stats
        }
