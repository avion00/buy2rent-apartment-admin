#!/usr/bin/env python
"""
Get Product UUIDs for replacement_of field
"""

import os
import sys
import django
import json

def setup_django():
    """Setup Django environment"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    django.setup()

def get_all_products():
    """Get all products with their UUIDs"""
    print("📋 Available Products for replacement_of field")
    print("=" * 60)
    
    try:
        from products.models import Product
        
        products = Product.objects.all().order_by('-created_at')
        
        if not products.exists():
            print("❌ No products found in database")
            print("\n💡 Create some products first, then use their UUIDs for replacement_of")
            return
        
        print(f"Found {products.count()} products:\n")
        
        for i, product in enumerate(products, 1):
            print(f"{i}. Product: {product.product}")
            print(f"   UUID: {product.id}")
            print(f"   SKU: {product.sku}")
            print(f"   Apartment: {product.apartment.name}")
            print(f"   Vendor: {product.vendor.name}")
            print(f"   Status: {product.status}")
            print(f"   Created: {product.created_at.strftime('%Y-%m-%d %H:%M')}")
            print("-" * 40)
        
        print("\n💡 Usage:")
        print("To create a replacement product, copy the UUID of the product you want to replace")
        print("and use it in the 'replacement_of' field.")
        
        print("\n📝 Example API Request:")
        if products.exists():
            example_product = products.first()
            print(f"""
POST /api/products/
{{
  "apartment": "{example_product.apartment.id}",
  "product": "{example_product.product} (Replacement)",
  "vendor": "{example_product.vendor.id}",
  "sku": "{example_product.sku}-R",
  "unit_price": {example_product.unit_price},
  "qty": 1,
  "replacement_of": "{example_product.id}",  ← Use this UUID
  "image_url": "https://example.com/replacement-image.jpg"
}}""")
        
    except Exception as e:
        print(f"❌ Error getting products: {e}")

def get_products_by_apartment():
    """Get products grouped by apartment"""
    print("\n🏠 Products by Apartment")
    print("=" * 60)
    
    try:
        from products.models import Product
        from apartments.models import Apartment
        
        apartments = Apartment.objects.all()
        
        for apartment in apartments:
            products = Product.objects.filter(apartment=apartment)
            if products.exists():
                print(f"\n🏠 {apartment.name} (UUID: {apartment.id})")
                print("-" * 40)
                
                for product in products:
                    print(f"  📦 {product.product}")
                    print(f"     UUID: {product.id}")
                    print(f"     Status: {product.status}")
                    print(f"     Vendor: {product.vendor.name}")
                    print()
        
    except Exception as e:
        print(f"❌ Error getting products by apartment: {e}")

def create_sample_product():
    """Create a sample product for testing"""
    print("\n🧪 Create Sample Product")
    print("=" * 40)
    
    try:
        from products.models import Product
        from apartments.models import Apartment
        from vendors.models import Vendor
        
        # Check if we have apartments and vendors
        if not Apartment.objects.exists():
            print("❌ No apartments found. Create an apartment first.")
            return
        
        if not Vendor.objects.exists():
            print("❌ No vendors found. Create a vendor first.")
            return
        
        apartment = Apartment.objects.first()
        vendor = Vendor.objects.first()
        
        # Create sample product
        product = Product.objects.create(
            apartment=apartment,
            product="Sample Product for Testing",
            vendor=vendor,
            sku="SAMPLE-001",
            unit_price=99.99,
            qty=1,
            status="Design Approved",
            image_url="https://example.com/sample-product.jpg"
        )
        
        print(f"✅ Sample product created!")
        print(f"   UUID: {product.id}")
        print(f"   Name: {product.product}")
        print(f"   Apartment: {apartment.name}")
        print(f"   Vendor: {vendor.name}")
        
        print(f"\n💡 Now you can create a replacement using this UUID:")
        print(f"   replacement_of: \"{product.id}\"")
        
    except Exception as e:
        print(f"❌ Error creating sample product: {e}")

def main():
    """Main function"""
    print("🔍 Product UUID Helper")
    print("=" * 60)
    
    setup_django()
    
    # Get all products
    get_all_products()
    
    # Get products by apartment
    get_products_by_apartment()
    
    # Offer to create sample product
    print("\n" + "=" * 60)
    print("🎯 SOLUTIONS")
    print("=" * 60)
    
    print("\n✅ For NEW products (most common):")
    print("   - Leave 'replacement_of' field EMPTY")
    print("   - Don't include it in your JSON request")
    print("   - This is for regular product orders")
    
    print("\n🔄 For REPLACEMENT products:")
    print("   - Copy UUID from existing product above")
    print("   - Use it in 'replacement_of' field")
    print("   - Only when replacing damaged/wrong items")
    
    print("\n📝 Correct JSON for NEW product:")
    print("""{
  "apartment": "apartment-uuid-here",
  "product": "New Product Name",
  "vendor": "vendor-uuid-here",
  "sku": "SKU-001",
  "unit_price": 99.99,
  "qty": 1,
  "image_url": "https://example.com/image.jpg"
  // No replacement_of field needed!
}""")
    
    # Ask if user wants to create sample
    try:
        from products.models import Product
        if not Product.objects.exists():
            print("\n🧪 No products exist yet.")
            create_sample = input("Create a sample product for testing? (y/N): ").lower().strip()
            if create_sample == 'y':
                create_sample_product()
    except:
        pass

if __name__ == '__main__':
    main()
