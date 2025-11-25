#!/usr/bin/env python
"""
Test script to verify image URLs are being returned correctly by the API
"""
import os
import sys
import django
import requests
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Product
from products.serializers import ProductSerializer
from django.test import RequestFactory

def test_image_urls():
    print("🔍 TESTING IMAGE URLs IN API")
    print("=" * 50)
    
    # Get products with images
    products_with_images = Product.objects.exclude(
        product_image__isnull=True
    ).exclude(
        product_image__exact=''
    )[:5]
    
    if not products_with_images:
        print("❌ No products with images found")
        return
    
    print(f"📊 Found {len(products_with_images)} products with images")
    print()
    
    # Create a mock request for the serializer context
    factory = RequestFactory()
    request = factory.get('/api/products/')
    request.META['HTTP_HOST'] = 'localhost:8000'
    request.META['wsgi.url_scheme'] = 'http'
    
    for i, product in enumerate(products_with_images, 1):
        print(f"🔸 Product {i}: {product.product}")
        print(f"   Database fields:")
        print(f"      product_image: '{product.product_image}'")
        print(f"      image_url: '{product.image_url}'")
        
        # Test serializer
        serializer = ProductSerializer(product, context={'request': request})
        data = serializer.data
        
        print(f"   Serialized fields:")
        print(f"      product_image: '{data.get('product_image', 'NOT FOUND')}'")
        print(f"      image_url: '{data.get('image_url', 'NOT FOUND')}'")
        print(f"      imageUrl: '{data.get('imageUrl', 'NOT FOUND')}'")
        
        # Check if URLs are accessible
        image_url = data.get('product_image') or data.get('image_url')
        if image_url and image_url.startswith('http'):
            print(f"   🌐 Testing URL accessibility...")
            try:
                response = requests.head(image_url, timeout=5)
                if response.status_code == 200:
                    print(f"      ✅ URL accessible: {response.status_code}")
                else:
                    print(f"      ⚠️  URL returned: {response.status_code}")
            except Exception as e:
                print(f"      ❌ URL not accessible: {str(e)}")
        else:
            print(f"      ❌ Invalid or missing URL")
        
        print("-" * 40)

def test_api_endpoint():
    print("\n🌐 TESTING API ENDPOINT")
    print("=" * 30)
    
    try:
        # Test the actual API endpoint
        response = requests.get('http://localhost:8000/api/products/', timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API accessible, returned {len(data)} products")
            
            # Check first product with image
            for product in data[:3]:
                if product.get('product_image') or product.get('image_url'):
                    print(f"\n📦 Product: {product.get('product', 'Unknown')}")
                    print(f"   product_image: {product.get('product_image', 'None')}")
                    print(f"   image_url: {product.get('image_url', 'None')}")
                    print(f"   imageUrl: {product.get('imageUrl', 'None')}")
                    break
        else:
            print(f"❌ API returned status: {response.status_code}")
            
    except Exception as e:
        print(f"❌ API test failed: {str(e)}")
        print("   Make sure Django server is running on localhost:8000")

if __name__ == "__main__":
    test_image_urls()
    test_api_endpoint()
