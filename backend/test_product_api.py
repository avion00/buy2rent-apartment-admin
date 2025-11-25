#!/usr/bin/env python3
"""
Test script for Product API endpoints
Run this after starting the Django server to test all product API functionality
"""

import os
import sys
import django
import requests
import json
from datetime import date, datetime

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Product
from apartments.models import Apartment
from vendors.models import Vendor

API_BASE_URL = 'http://localhost:8000/api'

def test_product_api():
    """Test all product API endpoints"""
    print("🔧 Testing Product API Endpoints...")
    
    try:
        # Test 1: Get all products
        print("\n1. Testing GET /api/products/")
        response = requests.get(f'{API_BASE_URL}/products/')
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            products = response.json()
            if isinstance(products, dict) and 'results' in products:
                products = products['results']
            print(f"   Found {len(products)} products")
            if products:
                print(f"   Sample product fields: {list(products[0].keys())}")
        else:
            print(f"   Error: {response.text}")
        
        # Test 2: Filter products by apartment
        print("\n2. Testing GET /api/products/?apartment=<apartment_id>")
        apartments = Apartment.objects.all()[:1]
        if apartments:
            apartment_id = apartments[0].id
            response = requests.get(f'{API_BASE_URL}/products/?apartment={apartment_id}')
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                products = response.json()
                if isinstance(products, dict) and 'results' in products:
                    products = products['results']
                print(f"   Found {len(products)} products for apartment {apartment_id}")
        
        # Test 3: Get product statistics
        print("\n3. Testing GET /api/products/statistics/?apartment_id=<apartment_id>")
        if apartments:
            apartment_id = apartments[0].id
            response = requests.get(f'{API_BASE_URL}/products/statistics/?apartment_id={apartment_id}')
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                stats = response.json()
                print(f"   Statistics: {json.dumps(stats, indent=2)}")
        
        # Test 4: Get products by apartment (custom endpoint)
        print("\n4. Testing GET /api/products/by_apartment/?apartment_id=<apartment_id>")
        if apartments:
            apartment_id = apartments[0].id
            response = requests.get(f'{API_BASE_URL}/products/by_apartment/?apartment_id={apartment_id}')
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                products = response.json()
                print(f"   Found {len(products)} products via custom endpoint")
        
        # Test 5: Check if we have sample data
        print("\n5. Checking sample data...")
        product_count = Product.objects.count()
        apartment_count = Apartment.objects.count()
        vendor_count = Vendor.objects.count()
        
        print(f"   Products in DB: {product_count}")
        print(f"   Apartments in DB: {apartment_count}")
        print(f"   Vendors in DB: {vendor_count}")
        
        if product_count == 0:
            print("\n⚠️  No products found in database!")
            print("   Consider creating sample data for testing.")
        
        print("\n✅ Product API test completed!")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Connection Error!")
        print("   Make sure Django server is running: python manage.py runserver")
    except Exception as e:
        print(f"\n❌ Test Error: {str(e)}")

def create_sample_data():
    """Create sample data for testing"""
    print("\n🔧 Creating sample data...")
    
    try:
        # Create sample apartment if none exists
        if not Apartment.objects.exists():
            apartment = Apartment.objects.create(
                name="Sample Apartment",
                address="123 Test Street",
                type="Studio",
                status="Active"
            )
            print(f"   Created apartment: {apartment.name}")
        else:
            apartment = Apartment.objects.first()
        
        # Create sample vendor if none exists
        if not Vendor.objects.exists():
            vendor = Vendor.objects.create(
                name="Sample Vendor",
                email="vendor@example.com",
                phone="+1234567890"
            )
            print(f"   Created vendor: {vendor.name}")
        else:
            vendor = Vendor.objects.first()
        
        # Create sample products if none exist
        if not Product.objects.exists():
            products_data = [
                {
                    'product': 'Modern Sofa',
                    'sku': 'SOFA-001',
                    'unit_price': 89900,
                    'qty': 1,
                    'status': 'Ordered',
                    'category': 'Furniture',
                    'room': 'Living Room',
                    'payment_status': 'Paid',
                    'payment_amount': 89900,
                    'paid_amount': 89900,
                },
                {
                    'product': 'Dining Table',
                    'sku': 'TABLE-001',
                    'unit_price': 45000,
                    'qty': 1,
                    'status': 'Delivered',
                    'category': 'Furniture',
                    'room': 'Dining Room',
                    'payment_status': 'Paid',
                    'payment_amount': 45000,
                    'paid_amount': 45000,
                    'actual_delivery_date': date.today(),
                },
                {
                    'product': 'LED TV 55"',
                    'sku': 'TV-055-001',
                    'unit_price': 125000,
                    'qty': 1,
                    'status': 'Shipped',
                    'category': 'Electronics',
                    'room': 'Living Room',
                    'payment_status': 'Partially Paid',
                    'payment_amount': 125000,
                    'paid_amount': 62500,
                    'expected_delivery_date': date.today(),
                }
            ]
            
            for product_data in products_data:
                product = Product.objects.create(
                    apartment=apartment,
                    vendor=vendor,
                    **product_data
                )
                print(f"   Created product: {product.product}")
        
        print("✅ Sample data created successfully!")
        
    except Exception as e:
        print(f"❌ Error creating sample data: {str(e)}")

if __name__ == '__main__':
    print("🚀 Product API Testing Script")
    print("=" * 50)
    
    # Check if we should create sample data
    if len(sys.argv) > 1 and sys.argv[1] == '--create-sample':
        create_sample_data()
    
    # Run API tests
    test_product_api()
