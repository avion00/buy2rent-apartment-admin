#!/usr/bin/env python
"""
Check image data in products
"""
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Product
from django.conf import settings

def check_image_data():
    """Check image data in products"""
    print("🖼️  CHECKING PRODUCT IMAGE DATA")
    print("=" * 40)
    
    products = Product.objects.all()
    print(f"📦 Total Products: {products.count()}")
    
    # Check image fields
    products_with_image_url = products.exclude(image_url__isnull=True).exclude(image_url='')
    products_with_product_image = products.exclude(product_image__isnull=True).exclude(product_image='')
    
    print(f"🖼️  Products with image_url: {products_with_image_url.count()}")
    print(f"📷 Products with product_image: {products_with_product_image.count()}")
    
    print(f"\n📁 Media Settings:")
    print(f"   • MEDIA_URL: {settings.MEDIA_URL}")
    print(f"   • MEDIA_ROOT: {settings.MEDIA_ROOT}")
    print(f"   • Media directory exists: {os.path.exists(settings.MEDIA_ROOT)}")
    
    # Check if media/products directory exists
    products_media_dir = os.path.join(settings.MEDIA_ROOT, 'products')
    print(f"   • Products media dir: {products_media_dir}")
    print(f"   • Products media exists: {os.path.exists(products_media_dir)}")
    
    if os.path.exists(products_media_dir):
        try:
            subdirs = [d for d in os.listdir(products_media_dir) if os.path.isdir(os.path.join(products_media_dir, d))]
            print(f"   • Apartment subdirs: {len(subdirs)}")
            for subdir in subdirs[:5]:  # Show first 5
                subdir_path = os.path.join(products_media_dir, subdir)
                files = [f for f in os.listdir(subdir_path) if os.path.isfile(os.path.join(subdir_path, f))]
                print(f"     - {subdir}: {len(files)} files")
        except Exception as e:
            print(f"   • Error reading directory: {e}")
    
    print(f"\n📋 Sample Products with Images:")
    print("-" * 35)
    
    # Show products with any image data
    sample_products = products.filter(
        models.Q(image_url__isnull=False) | models.Q(product_image__isnull=False)
    ).exclude(
        models.Q(image_url='') & models.Q(product_image='')
    )[:10]
    
    if sample_products.exists():
        for product in sample_products:
            print(f"\n🏷️  {product.product}")
            print(f"   • ID: {product.id}")
            print(f"   • Apartment: {product.apartment.name}")
            print(f"   • image_url: {product.image_url or 'None'}")
            print(f"   • product_image: {product.product_image or 'None'}")
            
            # Check if it's a local file
            if product.image_url and product.image_url.startswith('/media/'):
                local_path = os.path.join(settings.MEDIA_ROOT, product.image_url.replace('/media/', ''))
                print(f"   • Local file exists: {os.path.exists(local_path)}")
    else:
        print("❌ No products found with image data")
        
        # Show all products to debug
        print(f"\n🔍 All Products (first 5):")
        for product in products[:5]:
            print(f"   • {product.product}")
            print(f"     - image_url: '{product.image_url}'")
            print(f"     - product_image: '{product.product_image}'")
    
    return True

if __name__ == "__main__":
    # Import Q for database queries
    from django.db import models
    
    print("🚀 IMAGE DATA CHECK\n")
    
    try:
        check_image_data()
        print(f"\n✅ Check complete!")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
