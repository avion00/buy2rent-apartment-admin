#!/usr/bin/env python
"""
Test the new demo file with images
"""
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Product
from apartments.models import Apartment

def test_new_demo():
    print("🧪 TESTING NEW DEMO FILE RESULTS")
    print("=" * 35)
    
    # Check most recent apartment
    recent_apartments = Apartment.objects.all().order_by('-created_at')[:3]
    
    print(f"📊 Recent Apartments:")
    for i, apt in enumerate(recent_apartments, 1):
        product_count = Product.objects.filter(apartment=apt).count()
        print(f"   {i}. {apt.name} - {product_count} products")
    
    if recent_apartments.exists():
        # Check the most recent apartment (should be the test)
        test_apartment = recent_apartments.first()
        products = Product.objects.filter(apartment=test_apartment)
        
        print(f"\n🎯 Analyzing: {test_apartment.name}")
        print(f"📦 Products: {products.count()}")
        
        images_found = 0
        for product in products:
            has_image = bool(product.image_url or product.product_image)
            if has_image:
                images_found += 1
                print(f"   ✅ {product.product}: {product.image_url or product.product_image}")
            else:
                print(f"   ❌ {product.product}: No image")
        
        print(f"\n📊 RESULTS:")
        print(f"   • Total products: {products.count()}")
        print(f"   • Products with images: {images_found}")
        print(f"   • Success rate: {(images_found/products.count()*100):.1f}%" if products.count() > 0 else "   • No products found")
        
        if images_found > 0:
            print(f"\n🎉 SUCCESS! Image import is working!")
        else:
            print(f"\n❌ FAILED! Still no images imported")
            print(f"   Check if you uploaded the NEW demo_with_images.xlsx file")
    else:
        print(f"\n❌ No apartments found. Import the demo file first.")

if __name__ == "__main__":
    test_new_demo()
