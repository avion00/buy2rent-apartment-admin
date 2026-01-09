#!/usr/bin/env python
"""
Check what data exists in the database
"""
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Product
from products.category_models import ProductCategory, ImportSession
from apartments.models import Apartment

def check_imported_data():
    """Check what data exists in database"""
    print("🔍 CHECKING IMPORTED DATA")
    print("=" * 25)
    
    # Check apartments
    apartments = Apartment.objects.all()
    print(f"🏠 Apartments: {apartments.count()}")
    for apt in apartments:
        print(f"   • {apt.name} (ID: {apt.id})")
    
    # Check import sessions
    sessions = ImportSession.objects.all().order_by('-started_at')
    print(f"\n📥 Import Sessions: {sessions.count()}")
    for session in sessions:
        print(f"   • {session.file_name} - {session.status}")
        print(f"     Products: {session.successful_imports}/{session.total_products}")
        print(f"     Started: {session.started_at}")
    
    # Check categories
    categories = ProductCategory.objects.all()
    print(f"\n📁 Categories: {categories.count()}")
    for category in categories:
        product_count = Product.objects.filter(category=category).count()
        print(f"   • {category.name} ({category.sheet_name}) - {product_count} products")
    
    # Check products
    products = Product.objects.all().order_by('-created_at')
    print(f"\n📦 Products: {products.count()}")
    
    if products.exists():
        print(f"\n📝 Recent Products:")
        for product in products[:5]:  # Show first 5
            print(f"   • {product.product}")
            print(f"     Apartment: {product.apartment.name}")
            print(f"     Category: {product.category.name if product.category else 'None'}")
            print(f"     S.N: '{product.sn}'")
            print(f"     Room: '{product.room}'")
            print(f"     Cost: '{product.cost}'")
            print(f"     Price: {product.unit_price}")
            print(f"     Created: {product.created_at}")
            print()
    else:
        print("   ❌ No products found!")
    
    # Show API endpoints
    if apartments.exists():
        apartment = apartments.first()
        print(f"🔗 API ENDPOINTS TO CHECK:")
        print(f"   Products for apartment: GET /api/products/?apartment={apartment.id}")
        print(f"   All products: GET /api/products/")
        print(f"   Admin interface: http://localhost:8000/admin/products/product/")
    
    return products.count() > 0

if __name__ == "__main__":
    has_data = check_imported_data()
    
    if not has_data:
        print("\n⚠️  NO IMPORTED DATA FOUND!")
        print("\n🔧 Next steps:")
        print("1. Run: python test_fixed_import.py")
        print("2. Try importing from frontend again")
        print("3. Check Django server logs for errors")
    else:
        print("\n✅ Data found! Use the API endpoints above to view it.")
