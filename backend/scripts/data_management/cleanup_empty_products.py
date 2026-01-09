#!/usr/bin/env python
"""
Clean up existing empty/meaningless products from the database
"""
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Product
from django.db.models import Q

def cleanup_empty_products():
    """Remove products that have no meaningful data"""
    print("🧹 CLEANING UP EMPTY PRODUCTS")
    print("=" * 30)
    
    # Find products that are essentially empty
    empty_products = Product.objects.filter(
        Q(product='Unnamed Product') | Q(product='') | Q(product__isnull=True)
    ).filter(
        Q(description='') | Q(description__isnull=True)
    ).filter(
        Q(cost='') | Q(cost__isnull=True)
    ).filter(
        Q(room='') | Q(room__isnull=True)
    ).filter(
        Q(link='') | Q(link__isnull=True)
    ).filter(
        Q(unit_price=0) | Q(unit_price__isnull=True)
    )
    
    print(f"📊 Found {empty_products.count()} empty products")
    
    if empty_products.count() == 0:
        print("✅ No empty products found!")
        return
    
    # Show some examples
    print(f"\n📋 Examples of empty products to be deleted:")
    for product in empty_products[:5]:
        print(f"   • ID: {product.id}")
        print(f"     Product: '{product.product}'")
        print(f"     Description: '{product.description}'")
        print(f"     Cost: '{product.cost}'")
        print(f"     Room: '{product.room}'")
        print(f"     S.N: '{product.sn}'")
        print(f"     Created: {product.created_at}")
        print()
    
    if empty_products.count() > 5:
        print(f"   ... and {empty_products.count() - 5} more")
    
    # Ask for confirmation
    print(f"⚠️  WARNING: This will permanently delete {empty_products.count()} products!")
    response = input("Do you want to proceed? (yes/no): ").lower().strip()
    
    if response in ['yes', 'y']:
        deleted_count = empty_products.count()
        empty_products.delete()
        print(f"✅ Successfully deleted {deleted_count} empty products!")
    else:
        print("❌ Cleanup cancelled")

def show_remaining_products():
    """Show remaining products after cleanup"""
    print(f"\n📊 REMAINING PRODUCTS SUMMARY")
    print("=" * 30)
    
    total_products = Product.objects.count()
    print(f"Total products: {total_products}")
    
    if total_products > 0:
        # Show products by category
        from products.category_models import ProductCategory
        categories = ProductCategory.objects.all()
        
        for category in categories:
            product_count = Product.objects.filter(category=category).count()
            print(f"   • {category.name}: {product_count} products")
        
        # Show some examples of remaining products
        print(f"\n📋 Examples of remaining products:")
        meaningful_products = Product.objects.exclude(
            Q(product='Unnamed Product') | Q(product='') | Q(product__isnull=True)
        )[:3]
        
        for product in meaningful_products:
            print(f"   • {product.product} (Room: {product.room}, Cost: {product.cost})")
    
    print(f"\n🎉 Database cleanup complete!")

if __name__ == "__main__":
    print("🚀 PRODUCT DATABASE CLEANUP TOOL\n")
    
    cleanup_empty_products()
    show_remaining_products()
    
    print(f"\n🚀 Next steps:")
    print(f"1. Test the improved import with: python test_empty_row_filtering.py")
    print(f"2. Re-import your Excel file to see only meaningful products")
    print(f"3. Check /api/products/ to verify clean data")
