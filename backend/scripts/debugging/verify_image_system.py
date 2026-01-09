#!/usr/bin/env python
"""
Comprehensive verification of image system
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
from django.conf import settings
from django.db import models

def verify_image_system():
    """Comprehensive verification of image system"""
    print("🔍 COMPREHENSIVE IMAGE SYSTEM CHECK")
    print("=" * 40)
    
    # 1. Check Django settings
    print("⚙️  1. DJANGO SETTINGS")
    print(f"   • MEDIA_URL: {settings.MEDIA_URL}")
    print(f"   • MEDIA_ROOT: {settings.MEDIA_ROOT}")
    print(f"   • Media root exists: {os.path.exists(settings.MEDIA_ROOT)}")
    
    # Create media directory if it doesn't exist
    if not os.path.exists(settings.MEDIA_ROOT):
        os.makedirs(settings.MEDIA_ROOT)
        print(f"   ✅ Created media directory: {settings.MEDIA_ROOT}")
    
    products_dir = os.path.join(settings.MEDIA_ROOT, 'products')
    if not os.path.exists(products_dir):
        os.makedirs(products_dir)
        print(f"   ✅ Created products directory: {products_dir}")
    
    # 2. Check sample Excel file
    print(f"\n📊 2. SAMPLE EXCEL FILE")
    excel_file = 'sample_products_with_images.xlsx'
    excel_exists = os.path.exists(excel_file)
    print(f"   • File exists: {excel_exists}")
    if excel_exists:
        file_size = os.path.getsize(excel_file)
        print(f"   • File size: {file_size} bytes")
    
    # 3. Check current database state
    print(f"\n🗄️  3. DATABASE STATE")
    apartments = Apartment.objects.all()
    products = Product.objects.all()
    print(f"   • Apartments: {apartments.count()}")
    print(f"   • Products: {products.count()}")
    
    # Check products with image data
    products_with_images = products.filter(
        models.Q(image_url__isnull=False) | models.Q(product_image__isnull=False)
    ).exclude(
        models.Q(image_url='') & models.Q(product_image='')
    )
    print(f"   • Products with image data: {products_with_images.count()}")
    
    # 4. Check admin configuration
    print(f"\n👨‍💼 4. ADMIN CONFIGURATION")
    try:
        from products.admin import ProductAdmin
        admin_instance = ProductAdmin(Product, None)
        
        # Check if image_display method exists
        has_image_display = hasattr(admin_instance, 'image_display')
        print(f"   • image_display method: {'✅ Present' if has_image_display else '❌ Missing'}")
        
        # Check list_display
        list_display = admin_instance.list_display
        has_image_in_display = 'image_display' in list_display
        print(f"   • image_display in list_display: {'✅ Yes' if has_image_in_display else '❌ No'}")
        
    except Exception as e:
        print(f"   ❌ Admin check failed: {e}")
    
    # 5. Check import service
    print(f"\n📥 5. IMPORT SERVICE")
    try:
        from products.import_service import ProductImportService
        service = ProductImportService()
        
        # Check if enhanced methods exist
        has_process_image = hasattr(service, '_process_product_image')
        has_download_image = hasattr(service, '_download_and_store_image')
        
        print(f"   • _process_product_image method: {'✅ Present' if has_process_image else '❌ Missing'}")
        print(f"   • _download_and_store_image method: {'✅ Present' if has_download_image else '❌ Missing'}")
        
    except Exception as e:
        print(f"   ❌ Import service check failed: {e}")
    
    # 6. Sample products with images (if any exist)
    print(f"\n📦 6. SAMPLE PRODUCTS")
    if products_with_images.exists():
        print(f"   Found {products_with_images.count()} products with image data:")
        for i, product in enumerate(products_with_images[:3], 1):
            print(f"   {i}. {product.product}")
            print(f"      • image_url: {product.image_url or 'None'}")
            print(f"      • product_image: {product.product_image or 'None'}")
            
            # Check if local file exists
            image_url = product.image_url or product.product_image
            if image_url and image_url.startswith('/media/'):
                local_path = os.path.join(settings.MEDIA_ROOT, image_url.replace('/media/', ''))
                exists = os.path.exists(local_path)
                print(f"      • Local file exists: {exists}")
    else:
        print(f"   No products with image data found")
    
    # 7. Frontend files check
    print(f"\n🖥️  7. FRONTEND FILES")
    frontend_files = [
        'e:\\meir\\buy2rent-apartment-admin\\frontend\\src\\pages\\ApartmentView.tsx',
        'e:\\meir\\buy2rent-apartment-admin\\frontend\\src\\pages\\ProductView.tsx'
    ]
    
    for file_path in frontend_files:
        if os.path.exists(file_path):
            print(f"   ✅ {os.path.basename(file_path)} exists")
        else:
            print(f"   ❌ {os.path.basename(file_path)} missing")
    
    # 8. System status summary
    print(f"\n📋 8. SYSTEM STATUS SUMMARY")
    print("=" * 30)
    
    all_checks = [
        ("Media directories", os.path.exists(settings.MEDIA_ROOT) and os.path.exists(products_dir)),
        ("Sample Excel file", excel_exists),
        ("Admin image display", has_image_display if 'has_image_display' in locals() else False),
        ("Import service enhanced", has_process_image if 'has_process_image' in locals() else False),
        ("Database ready", True),  # Always true if we got this far
    ]
    
    all_good = all(status for _, status in all_checks)
    
    for check_name, status in all_checks:
        icon = "✅" if status else "❌"
        print(f"   {icon} {check_name}")
    
    print(f"\n🎯 OVERALL STATUS: {'🎉 READY FOR TESTING!' if all_good else '⚠️  NEEDS ATTENTION'}")
    
    # 9. Next steps
    print(f"\n📋 NEXT STEPS:")
    print("-" * 15)
    if all_good:
        print("1. 🚀 **Test import**: Use frontend to upload sample_products_with_images.xlsx")
        print("2. 👀 **Check admin**: Go to /admin/products/product/ for image thumbnails")
        print("3. 🖥️  **Check frontend**: Go to apartment view for product images")
        print("4. 📁 **Verify storage**: Check /media/products/ for downloaded images")
    else:
        print("1. ⚠️  **Fix issues**: Address the failed checks above")
        print("2. 🔄 **Re-run verification**: Run this script again")
        print("3. 📞 **Get help**: Check error messages for specific issues")
    
    return all_good

if __name__ == "__main__":
    print("🚀 IMAGE SYSTEM VERIFICATION\n")
    
    try:
        success = verify_image_system()
        if success:
            print(f"\n🎉 ALL SYSTEMS GO!")
            print(f"   Image import and display system is ready for testing")
        else:
            print(f"\n⚠️  SOME ISSUES FOUND")
            print(f"   Please address the issues above before testing")
    except Exception as e:
        print(f"\n❌ Verification failed: {str(e)}")
        import traceback
        traceback.print_exc()
    
    print(f"\n✅ Verification complete!")
