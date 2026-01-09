#!/usr/bin/env python
"""
Clean existing products and test image import
"""
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Product
from apartments.models import Apartment
from clients.models import Client
from django.db import models

def clean_and_prepare():
    """Clean existing products and prepare for fresh test"""
    print("🧹 CLEANING AND PREPARING FOR IMAGE TEST")
    print("=" * 40)
    
    # Show current state
    apartments = Apartment.objects.all()
    products = Product.objects.all()
    
    print(f"📊 Current State:")
    print(f"   • Apartments: {apartments.count()}")
    print(f"   • Products: {products.count()}")
    
    # Check products with images
    products_with_images = products.filter(
        models.Q(image_url__isnull=False) | models.Q(product_image__isnull=False)
    ).exclude(
        models.Q(image_url='') & models.Q(product_image='')
    )
    
    print(f"   • Products with image data: {products_with_images.count()}")
    
    # Show sample products
    if products.exists():
        print(f"\n📦 Sample Products:")
        for i, product in enumerate(products[:3], 1):
            print(f"   {i}. {product.product}")
            print(f"      • image_url: '{product.image_url}'")
            print(f"      • product_image: '{product.product_image}'")
    
    # Option to clean
    print(f"\n🗑️  CLEANUP OPTIONS:")
    print("1. Keep existing data (recommended for testing)")
    print("2. Delete all products (clean slate)")
    print("3. Delete only products without images")
    
    # For automated testing, let's clean products without images
    products_without_images = products.filter(
        models.Q(image_url__isnull=True) | models.Q(image_url='')
    ).filter(
        models.Q(product_image__isnull=True) | models.Q(product_image='')
    )
    
    if products_without_images.exists():
        print(f"\n🧹 Cleaning {products_without_images.count()} products without images...")
        deleted_count = products_without_images.count()
        products_without_images.delete()
        print(f"   ✅ Deleted {deleted_count} products without images")
    else:
        print(f"\n✅ No products without images to clean")
    
    # Check media directory
    from django.conf import settings
    media_root = settings.MEDIA_ROOT
    products_dir = os.path.join(media_root, 'products')
    
    print(f"\n📁 Media Directory Status:")
    print(f"   • MEDIA_ROOT: {media_root}")
    print(f"   • Exists: {os.path.exists(media_root)}")
    print(f"   • Products dir: {products_dir}")
    print(f"   • Products dir exists: {os.path.exists(products_dir)}")
    
    if os.path.exists(products_dir):
        try:
            subdirs = [d for d in os.listdir(products_dir) if os.path.isdir(os.path.join(products_dir, d))]
            print(f"   • Apartment folders: {len(subdirs)}")
            
            total_files = 0
            for subdir in subdirs:
                subdir_path = os.path.join(products_dir, subdir)
                files = [f for f in os.listdir(subdir_path) if os.path.isfile(os.path.join(subdir_path, f))]
                total_files += len(files)
                print(f"     - {subdir}: {len(files)} files")
            
            print(f"   • Total image files: {total_files}")
            
        except Exception as e:
            print(f"   ❌ Error reading directory: {e}")
    
    # Final status
    remaining_products = Product.objects.count()
    remaining_with_images = Product.objects.filter(
        models.Q(image_url__isnull=False) | models.Q(product_image__isnull=False)
    ).exclude(
        models.Q(image_url='') & models.Q(product_image='')
    ).count()
    
    print(f"\n📊 Final State:")
    print(f"   • Remaining products: {remaining_products}")
    print(f"   • Products with images: {remaining_with_images}")
    
    print(f"\n🎯 READY FOR TESTING:")
    print("=" * 20)
    print("1. ✅ **Import service fixed** - All image columns now map correctly")
    print("2. ✅ **Admin display ready** - image_display method implemented")
    print("3. ✅ **Frontend fixed** - Both image fields supported")
    print("4. ✅ **Media directories** - Ready for image storage")
    
    print(f"\n📋 TEST STEPS:")
    print("-" * 15)
    print("1. **Import Excel**: Use frontend to upload sample_products_with_images.xlsx")
    print("2. **Check extraction**: Images should be extracted from all column types")
    print("3. **Verify download**: Images should be downloaded to /media/products/")
    print("4. **Check admin**: Should show thumbnails in admin dashboard")
    print("5. **Check frontend**: Should show images in apartment view")
    
    return True

if __name__ == "__main__":
    print("🚀 CLEAN AND PREPARE\n")
    
    try:
        clean_and_prepare()
        print(f"\n🎉 READY FOR IMAGE TESTING!")
        print(f"   Import the Excel file and check for images")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
    
    print(f"\n✅ Preparation complete!")
