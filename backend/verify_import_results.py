#!/usr/bin/env python
"""
Verify image import results after frontend import
"""
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Product
from apartments.models import Apartment
from django.conf import settings
from django.db import models

def verify_import_results():
    """Verify the results of image import"""
    print("🔍 VERIFYING IMAGE IMPORT RESULTS")
    print("=" * 40)
    
    # Check recent apartments
    recent_apartments = Apartment.objects.all().order_by('-created_at')[:5]
    
    print(f"📊 Recent Apartments ({recent_apartments.count()}):")
    for i, apt in enumerate(recent_apartments, 1):
        product_count = Product.objects.filter(apartment=apt).count()
        print(f"   {i}. {apt.name} - {product_count} products")
    
    if not recent_apartments.exists():
        print("   ❌ No apartments found. Import an Excel file first.")
        return False
    
    # Focus on the most recent apartment (likely the test import)
    test_apartment = recent_apartments.first()
    print(f"\n🎯 Analyzing: {test_apartment.name}")
    print("-" * 30)
    
    # Get products from this apartment
    products = Product.objects.filter(apartment=test_apartment).order_by('created_at')
    
    print(f"📦 Products Found: {products.count()}")
    
    if products.count() == 0:
        print("   ❌ No products found in this apartment")
        return False
    
    # Analyze each product
    products_with_images = 0
    products_with_local_images = 0
    products_with_url_images = 0
    
    print(f"\n📋 Product Analysis:")
    for i, product in enumerate(products, 1):
        print(f"\n   {i}. {product.product}")
        print(f"      • ID: {product.id}")
        print(f"      • Category: {product.category}")
        print(f"      • Room: {product.room}")
        print(f"      • image_url: '{product.image_url}'")
        print(f"      • product_image: '{product.product_image}'")
        
        # Check image status
        has_image = bool(product.image_url or product.product_image)
        if has_image:
            products_with_images += 1
            
            image_url = product.image_url or product.product_image
            
            if image_url.startswith('/media/'):
                products_with_local_images += 1
                # Check if local file exists
                local_path = os.path.join(settings.MEDIA_ROOT, image_url.replace('/media/', ''))
                file_exists = os.path.exists(local_path)
                file_size = os.path.getsize(local_path) if file_exists else 0
                print(f"      • Type: Local file")
                print(f"      • File exists: {file_exists}")
                if file_exists:
                    print(f"      • File size: {file_size} bytes")
                    
            elif image_url.startswith(('http://', 'https://')):
                products_with_url_images += 1
                print(f"      • Type: External URL")
                print(f"      • URL: {image_url}")
            else:
                print(f"      • Type: Filename/Description")
        else:
            print(f"      • ❌ No image data")
    
    # Summary
    print(f"\n📊 SUMMARY:")
    print(f"   • Total products: {products.count()}")
    print(f"   • Products with images: {products_with_images}")
    print(f"   • Local images: {products_with_local_images}")
    print(f"   • URL images: {products_with_url_images}")
    print(f"   • Success rate: {(products_with_images/products.count()*100):.1f}%")
    
    # Check media directories
    print(f"\n📁 Media Directory Analysis:")
    media_root = settings.MEDIA_ROOT
    print(f"   • MEDIA_ROOT: {media_root}")
    print(f"   • Exists: {os.path.exists(media_root)}")
    
    if os.path.exists(media_root):
        # Check apartment_products directory
        apt_products_dir = os.path.join(media_root, 'apartment_products')
        if os.path.exists(apt_products_dir):
            print(f"   • apartment_products dir: ✅ Exists")
            
            # Check for apartment subdirectories
            apt_dirs = [d for d in os.listdir(apt_products_dir) if os.path.isdir(os.path.join(apt_products_dir, d))]
            print(f"   • Apartment folders: {len(apt_dirs)}")
            
            total_files = 0
            for apt_dir in apt_dirs:
                apt_path = os.path.join(apt_products_dir, apt_dir)
                files = [f for f in os.listdir(apt_path) if os.path.isfile(os.path.join(apt_path, f))]
                total_files += len(files)
                print(f"     - Apartment {apt_dir}: {len(files)} files")
                
                # Show sample files
                for file in files[:3]:  # Show first 3 files
                    file_path = os.path.join(apt_path, file)
                    file_size = os.path.getsize(file_path)
                    print(f"       • {file} ({file_size} bytes)")
            
            print(f"   • Total image files: {total_files}")
        else:
            print(f"   • apartment_products dir: ❌ Missing")
        
        # Check products directory (fallback)
        products_dir = os.path.join(media_root, 'products')
        if os.path.exists(products_dir):
            print(f"   • products dir: ✅ Exists")
            
            # Count files in products directory
            try:
                subdirs = [d for d in os.listdir(products_dir) if os.path.isdir(os.path.join(products_dir, d))]
                total_files = 0
                for subdir in subdirs:
                    subdir_path = os.path.join(products_dir, subdir)
                    files = [f for f in os.listdir(subdir_path) if os.path.isfile(os.path.join(subdir_path, f))]
                    total_files += len(files)
                
                print(f"   • Files in products dir: {total_files}")
            except Exception as e:
                print(f"   • Error reading products dir: {e}")
        else:
            print(f"   • products dir: ❌ Missing")
    
    # Final assessment
    print(f"\n🎯 FINAL ASSESSMENT:")
    print("=" * 20)
    
    if products_with_images > 0:
        print(f"✅ SUCCESS! Images imported successfully")
        print(f"   • {products_with_images}/{products.count()} products have images")
        
        if products_with_local_images > 0:
            print(f"   • {products_with_local_images} images downloaded and stored locally")
        
        if products_with_url_images > 0:
            print(f"   • {products_with_url_images} images stored as URLs")
        
        print(f"\n🎉 Image import system is working correctly!")
        
        return True
    else:
        print(f"❌ NO IMAGES IMPORTED")
        print(f"   This indicates an issue with the import process")
        
        print(f"\n🔧 Troubleshooting:")
        print(f"   1. Check if Excel file has image URLs in cells")
        print(f"   2. Verify column mapping is working")
        print(f"   3. Check network connectivity for image downloads")
        print(f"   4. Review Django logs for import errors")
        
        return False

def check_admin_display():
    """Check if admin display is configured correctly"""
    print(f"\n👨‍💼 ADMIN DISPLAY CHECK:")
    print("-" * 25)
    
    try:
        from products.admin import ProductAdmin
        from products.models import Product
        
        admin_instance = ProductAdmin(Product, None)
        
        # Check list_display
        list_display = admin_instance.list_display
        has_image_display = 'image_display' in list_display
        
        print(f"   • image_display in list_display: {'✅ Yes' if has_image_display else '❌ No'}")
        
        # Check if method exists
        has_method = hasattr(admin_instance, 'image_display')
        print(f"   • image_display method exists: {'✅ Yes' if has_method else '❌ No'}")
        
        if has_method:
            # Test method with a sample product
            products = Product.objects.all()
            if products.exists():
                sample_product = products.first()
                try:
                    result = admin_instance.image_display(sample_product)
                    print(f"   • Method test: ✅ Works")
                    if '<img' in str(result):
                        print(f"     - Returns HTML image tag")
                    elif result == '-':
                        print(f"     - Returns dash (no image)")
                    else:
                        print(f"     - Returns: {result}")
                except Exception as e:
                    print(f"   • Method test: ❌ Error - {e}")
        
        return has_image_display and has_method
        
    except Exception as e:
        print(f"   ❌ Admin check failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 IMAGE IMPORT VERIFICATION\n")
    
    try:
        # Main verification
        import_success = verify_import_results()
        
        # Admin display check
        admin_success = check_admin_display()
        
        print(f"\n📊 VERIFICATION RESULTS:")
        print(f"   • Image import: {'✅ SUCCESS' if import_success else '❌ FAILED'}")
        print(f"   • Admin display: {'✅ READY' if admin_success else '❌ NEEDS FIX'}")
        
        if import_success and admin_success:
            print(f"\n🎉 ALL SYSTEMS WORKING!")
            print(f"   Images should be visible in both admin and frontend")
        else:
            print(f"\n⚠️  SOME ISSUES FOUND")
            print(f"   Check the details above for specific problems")
        
    except Exception as e:
        print(f"\n❌ Verification failed: {str(e)}")
        import traceback
        traceback.print_exc()
    
    print(f"\n✅ Verification complete!")
