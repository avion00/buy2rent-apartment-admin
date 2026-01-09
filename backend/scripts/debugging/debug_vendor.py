#!/usr/bin/env python
"""
Debug script to check vendor data and test API endpoints
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

from vendors.models import Vendor
from django.test import Client

def check_vendors():
    """Check existing vendors in database"""
    print("🔍 Checking existing vendors...")
    
    vendors = Vendor.objects.all()
    print(f"Found {vendors.count()} vendors in database:")
    
    for vendor in vendors:
        print(f"  - ID: {vendor.id}")
        print(f"    Name: {vendor.name}")
        print(f"    Email: {vendor.email}")
        print(f"    Created: {vendor.created_at}")
        print()
    
    return vendors

def test_vendor_endpoints():
    """Test vendor API endpoints"""
    print("🧪 Testing vendor API endpoints...")
    
    client = Client()
    
    # Test basic vendors list
    print("Testing /api/vendors/")
    response = client.get('/api/vendors/')
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Response type: {type(data)}")
        if isinstance(data, dict) and 'results' in data:
            print(f"Found {len(data['results'])} vendors in API response")
        elif isinstance(data, list):
            print(f"Found {len(data)} vendors in API response")
    print()
    
    # Test specific vendor ID if exists
    vendors = Vendor.objects.all()
    if vendors.exists():
        vendor = vendors.first()
        print(f"Testing /api/vendors/{vendor.id}/")
        response = client.get(f'/api/vendors/{vendor.id}/')
        print(f"Status: {response.status_code}")
        
        print(f"Testing /api/vendors/{vendor.id}/frontend_detail/")
        response = client.get(f'/api/vendors/{vendor.id}/frontend_detail/')
        print(f"Status: {response.status_code}")
        
        print(f"Testing /api/vendors/frontend_detail_by_name/?name={vendor.name}")
        response = client.get(f'/api/vendors/frontend_detail_by_name/?name={vendor.name}')
        print(f"Status: {response.status_code}")
    
def create_sample_vendor():
    """Create a sample vendor for testing"""
    print("📝 Creating sample vendor...")
    
    vendor, created = Vendor.objects.get_or_create(
        name="IKEA Hungary",
        defaults={
            'email': 'contact@ikea.hu',
            'website': 'https://www.ikea.com/hu/',
            'logo': '🏠',
            'lead_time': '7-14 days',
            'reliability': 4.2,
            'orders_count': 15,
            'active_issues': 2,
            'company_name': 'IKEA Hungary Kft.',
            'contact_person': 'John Doe',
            'phone': '+36-1-234-5678'
        }
    )
    
    if created:
        print(f"✅ Created new vendor: {vendor.name} (ID: {vendor.id})")
    else:
        print(f"ℹ️  Vendor already exists: {vendor.name} (ID: {vendor.id})")
    
    return vendor

def main():
    """Main debug function"""
    print("🚀 Vendor Debug Script")
    print("=" * 50)
    
    try:
        # Check existing vendors
        vendors = check_vendors()
        
        # Create sample vendor if none exist
        if not vendors.exists():
            create_sample_vendor()
            vendors = check_vendors()
        
        # Test API endpoints
        test_vendor_endpoints()
        
        print("✅ Debug complete!")
        
        if vendors.exists():
            vendor = vendors.first()
            print(f"\n💡 Try accessing:")
            print(f"   - By ID: /vendors/{vendor.id}")
            print(f"   - By name: /vendors/{vendor.name.lower().replace(' ', '-')}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
