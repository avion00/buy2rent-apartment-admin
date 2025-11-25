#!/usr/bin/env python
"""
Test the serializer fix for image URLs
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Product
from products.serializers import ProductSerializer
from django.test import RequestFactory

def test_serializer_fix():
    print("🧪 TESTING SERIALIZER FIX")
    print("=" * 40)
    
    # Create a mock request
    factory = RequestFactory()
    request = factory.get('/api/products/')
    request.META['HTTP_HOST'] = 'localhost:8000'
    request.META['wsgi.url_scheme'] = 'http'
    
    # Get products with different types of image URLs
    products = Product.objects.all()[:5]
    
    for i, product in enumerate(products, 1):
        print(f"\n🔸 Product {i}: {product.product}")
        print(f"   Raw image data:")
        print(f"      product_image: '{product.product_image}'")
        print(f"      image_url: '{product.image_url}'")
        
        # Test serializer
        serializer = ProductSerializer(product, context={'request': request})
        data = serializer.data
        
        print(f"   Serialized URLs:")
        print(f"      product_image: '{data.get('product_image', 'None')}'")
        print(f"      image_url: '{data.get('image_url', 'None')}'")
        print(f"      imageUrl: '{data.get('imageUrl', 'None')}'")
        
        # Check if the fix worked
        image_url = data.get('imageUrl')
        if image_url:
            if image_url.startswith('http'):
                print(f"   ✅ Valid URL generated")
            else:
                print(f"   ❌ Invalid URL: {image_url}")
        else:
            print(f"   ⚪ No image URL (expected for file:// URLs)")
        
        print("-" * 30)

if __name__ == "__main__":
    test_serializer_fix()
