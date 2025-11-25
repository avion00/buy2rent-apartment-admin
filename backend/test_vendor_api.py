#!/usr/bin/env python
"""
Test script for VendorView API endpoints
Run this script to verify all vendor-related APIs are working correctly
"""

import os
import django
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).resolve().parent
sys.path.append(str(backend_dir))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from vendors.models import Vendor
from apartments.models import Apartment
from clients.models import Client
from orders.models import Order
from products.models import Product
from issues.models import Issue
from payments.models import Payment
import json

def create_test_data():
    """Create sample test data"""
    print("Creating test data...")
    
    # Create a test client
    client_obj = Client.objects.create(
        name="Test Client",
        email="test@example.com",
        phone="+1234567890",
        type="Investor",
        account_status="Active"
    )
    
    # Create a test apartment
    apartment = Apartment.objects.create(
        name="Test Apartment 101",
        type="furnishing",
        client=client_obj,
        address="123 Test Street, Test City",
        status="In Progress",
        designer="Test Designer",
        start_date="2024-01-01",
        due_date="2024-12-31",
        progress=50
    )
    
    # Create a test vendor
    vendor = Vendor.objects.create(
        name="IKEA Hungary",
        email="contact@ikea.hu",
        website="https://www.ikea.com/hu/",
        logo="🏠",
        lead_time="7-14 days",
        reliability=4.2,
        orders_count=15,
        active_issues=2,
        company_name="IKEA Hungary Kft.",
        contact_person="John Doe",
        phone="+36-1-234-5678"
    )
    
    # Create a test order
    order = Order.objects.create(
        po_number="ORD-001",
        apartment=apartment,
        vendor=vendor,
        items_count=3,
        total=2450.00,
        status="delivered",
        placed_on="2024-11-10"
    )
    
    # Create a test product
    product = Product.objects.create(
        apartment=apartment,
        product="Office Chair",
        vendor=vendor,
        sku="CHAIR-001",
        unit_price=299.99,
        qty=2,
        availability="In Stock",
        status="Delivered"
    )
    
    # Create a test issue
    issue = Issue.objects.create(
        apartment=apartment,
        product=product,
        vendor=vendor,
        type="Delivery",
        description="Product delivery delayed by 3 days",
        status="Open",
        priority="Medium"
    )
    
    # Create a test payment
    payment = Payment.objects.create(
        apartment=apartment,
        vendor=vendor,
        order_reference="ORD-001",
        total_amount=2450.00,
        amount_paid=2450.00,
        due_date="2024-11-15",
        status="Paid",
        last_payment_date="2024-11-10"
    )
    
    print(f"✅ Created test data:")
    print(f"   - Vendor: {vendor.name} (ID: {vendor.id})")
    print(f"   - Apartment: {apartment.name}")
    print(f"   - Order: {order.po_number}")
    print(f"   - Product: {product.product}")
    print(f"   - Issue: {issue.type}")
    print(f"   - Payment: {payment.order_reference}")
    
    return vendor

def test_api_endpoints(vendor):
    """Test all vendor-related API endpoints"""
    print(f"\n🧪 Testing API endpoints for vendor: {vendor.name}")
    
    client = Client()
    
    # Test basic vendor endpoints
    endpoints_to_test = [
        f'/api/vendors/',
        f'/api/vendors/{vendor.id}/',
        f'/api/vendors/{vendor.id}/frontend_detail/',
        f'/api/vendors/frontend_detail_by_name/?name=ikea-hungary',
        f'/api/vendors/{vendor.id}/products/',
        f'/api/vendors/{vendor.id}/orders/',
        f'/api/vendors/{vendor.id}/issues/',
        f'/api/vendors/{vendor.id}/payments/',
        f'/api/vendors/{vendor.id}/statistics/',
    ]
    
    results = []
    
    for endpoint in endpoints_to_test:
        try:
            response = client.get(endpoint)
            status = "✅ PASS" if response.status_code == 200 else f"❌ FAIL ({response.status_code})"
            results.append(f"{status} - {endpoint}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if endpoint.endswith('/statistics/'):
                        print(f"   📊 Statistics: {len(data)} metrics")
                    elif endpoint.endswith('/products/'):
                        print(f"   📦 Products: {len(data) if isinstance(data, list) else 'N/A'}")
                    elif endpoint.endswith('/orders/'):
                        print(f"   📋 Orders: {len(data) if isinstance(data, list) else 'N/A'}")
                    elif endpoint.endswith('/issues/'):
                        print(f"   ⚠️  Issues: {len(data) if isinstance(data, list) else 'N/A'}")
                    elif endpoint.endswith('/payments/'):
                        print(f"   💳 Payments: {len(data) if isinstance(data, list) else 'N/A'}")
                except:
                    pass
                    
        except Exception as e:
            results.append(f"❌ ERROR - {endpoint}: {str(e)}")
    
    print(f"\n📋 Test Results:")
    for result in results:
        print(f"   {result}")
    
    return results

def main():
    """Main test function"""
    print("🚀 Starting VendorView API Tests")
    print("=" * 50)
    
    try:
        # Create test data
        vendor = create_test_data()
        
        # Test API endpoints
        results = test_api_endpoints(vendor)
        
        # Summary
        passed = len([r for r in results if "✅ PASS" in r])
        total = len(results)
        
        print(f"\n📈 Summary:")
        print(f"   Passed: {passed}/{total}")
        print(f"   Success Rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print(f"\n🎉 All tests passed! VendorView API is ready for frontend integration.")
        else:
            print(f"\n⚠️  Some tests failed. Check the results above.")
            
        print(f"\n💡 Next Steps:")
        print(f"   1. Run migrations: python manage.py makemigrations && python manage.py migrate")
        print(f"   2. Start the development server: python manage.py runserver")
        print(f"   3. Test the frontend at: http://localhost:5173/vendors/ikea-hungary")
        
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
