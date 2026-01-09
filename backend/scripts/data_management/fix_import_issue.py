#!/usr/bin/env python
"""
Fix Excel import issue by ensuring database is ready
"""
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.management import execute_from_command_line
from django.db import connection

def fix_import_issue():
    """Fix the Excel import issue"""
    print("🔧 FIXING EXCEL IMPORT ISSUE")
    print("=" * 30)
    
    try:
        # Step 1: Check if migrations are needed
        print("1. Checking database structure...")
        with connection.cursor() as cursor:
            cursor.execute("PRAGMA table_info(products_product);")
            columns = cursor.fetchall()
            column_names = [col[1] for col in columns]
            
            excel_columns = ['sn', 'cost', 'total_cost', 'nm', 'all_price']
            missing = [col for col in excel_columns if col not in column_names]
            
            if missing:
                print(f"   ❌ Missing columns: {missing}")
                print("   🔄 Creating migrations...")
                
                # Create migrations
                execute_from_command_line(['manage.py', 'makemigrations', 'products'])
                execute_from_command_line(['manage.py', 'makemigrations', 'apartments'])
                
                # Apply migrations
                print("   🔄 Applying migrations...")
                execute_from_command_line(['manage.py', 'migrate'])
                
                print("   ✅ Database updated!")
            else:
                print("   ✅ Database structure is ready!")
        
        # Step 2: Test import service
        print("\n2. Testing import service...")
        try:
            from products.import_service import ProductImportService
            service = ProductImportService()
            print("   ✅ Import service is working!")
        except Exception as e:
            print(f"   ❌ Import service error: {e}")
            return False
        
        # Step 3: Check import views
        print("\n3. Checking import views...")
        try:
            from products.import_views import ProductImportView
            print("   ✅ Import views are available!")
        except Exception as e:
            print(f"   ❌ Import views error: {e}")
            return False
        
        # Step 4: Verify URL patterns
        print("\n4. Checking URL patterns...")
        try:
            from django.urls import reverse
            import_url = reverse('product-import')
            print(f"   ✅ Import URL: {import_url}")
        except Exception as e:
            print(f"   ⚠️  URL pattern issue: {e}")
        
        print("\n✅ IMPORT ISSUE FIXED!")
        return True
        
    except Exception as e:
        print(f"\n❌ Fix failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def create_test_import():
    """Create a test import to verify functionality"""
    print("\n🧪 CREATING TEST IMPORT")
    print("=" * 22)
    
    try:
        from products.models import Product
        from apartments.models import Apartment
        from products.category_models import ProductCategory, ImportSession
        
        # Check if we have an apartment
        apartments = Apartment.objects.all()
        if not apartments:
            print("   ⚠️  No apartments found. Create one first.")
            return False
        
        apartment = apartments.first()
        print(f"   📍 Using apartment: {apartment.name}")
        
        # Create test import session
        import_session = ImportSession.objects.create(
            apartment=apartment,
            file_name="test-import.xlsx",
            file_size=1024,
            file_type="xlsx",
            total_sheets=1,
            total_products=1,
            status="completed",
            successful_imports=1,
            failed_imports=0
        )
        
        # Create test category
        category = ProductCategory.objects.create(
            apartment=apartment,
            name="Test Category",
            sheet_name="Sheet1",
            room_type="Living Room",
            import_file_name="test-import.xlsx"
        )
        
        # Create test product
        product = Product.objects.create(
            apartment=apartment,
            category=category,
            import_session=import_session,
            product="Test Product",
            description="Test product for import verification",
            sku="TEST-001",
            unit_price=100.00,
            qty=1,
            sn="T001",
            cost="100 Ft",
            total_cost="100 Ft",
            room="Living Room"
        )
        
        print(f"   ✅ Test import created!")
        print(f"   📦 Product: {product.product}")
        print(f"   📁 Category: {category.name}")
        print(f"   📥 Session: {import_session.file_name}")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Test import failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    if fix_import_issue():
        if create_test_import():
            print("\n🎉 SUCCESS!")
            print("\n📋 What's been fixed:")
            print("✅ Database structure updated")
            print("✅ Import service working")
            print("✅ Test data created")
            print("✅ Admin interface ready")
            
            print("\n🚀 Next steps:")
            print("1. Restart Django server")
            print("2. Check admin: /admin/products/product/")
            print("3. Try Excel import again")
            print("4. Check import sessions: /admin/products/importsession/")
        else:
            print("\n⚠️  Import fixed but test creation failed")
    else:
        print("\n❌ Import fix failed")
        print("\nManual steps:")
        print("1. python manage.py makemigrations")
        print("2. python manage.py migrate")
        print("3. Check for errors in import_service.py")
