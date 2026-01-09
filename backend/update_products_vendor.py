#!/usr/bin/env python3
"""
Script to update all products in an apartment with a specific vendor
Usage: python3 update_products_vendor.py <apartment_id> <vendor_id>
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, '/root/buy2rent/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Product
from vendors.models import Vendor
from apartments.models import Apartment

def update_products_vendor(apartment_id, vendor_id):
    """Update all products in an apartment with a vendor"""
    try:
        # Get apartment
        apartment = Apartment.objects.get(id=apartment_id)
        print(f"✅ Found apartment: {apartment.name}")
        
        # Get vendor
        vendor = Vendor.objects.get(id=vendor_id)
        print(f"✅ Found vendor: {vendor.name}")
        
        # Get all products in apartment
        products = Product.objects.filter(apartment=apartment)
        total = products.count()
        print(f"📦 Found {total} products in apartment")
        
        # Update all products
        updated = products.update(vendor=vendor)
        print(f"✅ Updated {updated} products with vendor '{vendor.name}'")
        
        # Verify
        products_with_vendor = Product.objects.filter(apartment=apartment, vendor=vendor).count()
        print(f"✅ Verification: {products_with_vendor} products now have vendor '{vendor.name}'")
        
        return True
        
    except Apartment.DoesNotExist:
        print(f"❌ Error: Apartment with ID {apartment_id} not found")
        return False
    except Vendor.DoesNotExist:
        print(f"❌ Error: Vendor with ID {vendor_id} not found")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def list_vendors():
    """List all available vendors"""
    vendors = Vendor.objects.all()
    if vendors:
        print("\n📋 Available Vendors:")
        for v in vendors:
            print(f"  - {v.name} (ID: {v.id})")
    else:
        print("❌ No vendors found in database")

def list_apartments():
    """List all available apartments"""
    apartments = Apartment.objects.all()
    if apartments:
        print("\n🏢 Available Apartments:")
        for a in apartments:
            product_count = Product.objects.filter(apartment=a).count()
            print(f"  - {a.name} (ID: {a.id}) - {product_count} products")
    else:
        print("❌ No apartments found in database")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 update_products_vendor.py <apartment_id> <vendor_id>")
        print("   or: python3 update_products_vendor.py --list-vendors")
        print("   or: python3 update_products_vendor.py --list-apartments")
        sys.exit(1)
    
    if sys.argv[1] == '--list-vendors':
        list_vendors()
    elif sys.argv[1] == '--list-apartments':
        list_apartments()
    elif len(sys.argv) == 3:
        apartment_id = sys.argv[1]
        vendor_id = sys.argv[2]
        update_products_vendor(apartment_id, vendor_id)
    else:
        print("❌ Error: Invalid arguments")
        print("Usage: python3 update_products_vendor.py <apartment_id> <vendor_id>")
        sys.exit(1)
