#!/usr/bin/env python
"""
Debug script to check product image data
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'buy2rent_admin.settings')
django.setup()

from products.models import Product
from products.serializers import ProductSerializer

def main():
    print("🔍 DEBUGGING PRODUCT IMAGES")
    print("=" * 50)
    
    # Get products
    products = Product.objects.all()[:5]
    
    if not products:
        print("❌ No products found in database")
        return
    
    print(f"📊 Found {len(products)} products to check")
    print()
    
    for i, product in enumerate(products, 1):
        print(f"🔸 Product {i}: {product.product}")
        print(f"   ID: {product.id}")
        print(f"   Room: {product.room}")
        
        # Check database fields
        print(f"   📁 Database fields:")
        print(f"      product_image: '{product.product_image}'")
        print(f"      image_url: '{product.image_url}'")
        
        # Check serialized data
        print(f"   📤 Serialized data:")
        serializer = ProductSerializer(product)
        data = serializer.data
        print(f"      product_image: '{data.get('product_image', 'NOT FOUND')}'")
        print(f"      image_url: '{data.get('image_url', 'NOT FOUND')}'")
        
        # Check if any image data exists
        has_image = bool(product.product_image or product.image_url)
        print(f"   ✅ Has image data: {has_image}")
        
        if product.product_image:
            print(f"   🖼️  Image type: {'URL' if product.product_image.startswith('http') else 'File path'}")
        
        print("-" * 40)

if __name__ == "__main__":
    main()
