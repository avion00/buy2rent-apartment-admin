#!/usr/bin/env python3
"""
Simple script to check Product API setup
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Product
from apartments.models import Apartment
from vendors.models import Vendor
from products.serializers import ProductSerializer

def check_product_api():
    """Check if Product API is properly configured"""
    print("🔧 Checking Product API Configuration...")
    
    # Check models
    print(f"\n📊 Database Status:")
    print(f"   Products: {Product.objects.count()}")
    print(f"   Apartments: {Apartment.objects.count()}")
    print(f"   Vendors: {Vendor.objects.count()}")
    
    # Check serializer fields
    print(f"\n📋 Serializer Fields:")
    serializer = ProductSerializer()
    fields = list(serializer.fields.keys())
    print(f"   Total fields: {len(fields)}")
    
    # Check for frontend compatibility fields
    frontend_fields = [
        'imageUrl', 'vendorLink', 'unitPrice', 'expectedDeliveryDate',
        'actualDeliveryDate', 'paymentAmount', 'paidAmount', 'paymentStatus',
        'paymentDueDate', 'issueState', 'orderedOn', 'deliveryAddress',
        'deliveryCity', 'statusTags', 'deliveryStatusTags'
    ]
    
    missing_fields = [f for f in frontend_fields if f not in fields]
    if missing_fields:
        print(f"   ❌ Missing frontend fields: {missing_fields}")
    else:
        print(f"   ✅ All frontend compatibility fields present")
    
    # Check model properties
    print(f"\n🔍 Model Properties:")
    if hasattr(Product, 'status_tags'):
        print(f"   ✅ status_tags property exists")
    else:
        print(f"   ❌ status_tags property missing")
    
    if hasattr(Product, 'delivery_status_tags'):
        print(f"   ✅ delivery_status_tags property exists")
    else:
        print(f"   ❌ delivery_status_tags property missing")
    
    # Check if we have sample data
    if Product.objects.exists():
        sample_product = Product.objects.first()
        print(f"\n📦 Sample Product:")
        print(f"   ID: {sample_product.id}")
        print(f"   Name: {sample_product.product}")
        print(f"   Status: {sample_product.status}")
        print(f"   Status Tags: {sample_product.status_tags}")
        print(f"   Delivery Tags: {sample_product.delivery_status_tags}")
    else:
        print(f"\n⚠️  No products in database")
    
    print(f"\n✅ Product API check completed!")

if __name__ == '__main__':
    check_product_api()
