#!/usr/bin/env python
"""
Complete fix for Excel import issue
"""
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.management import execute_from_command_line
from django.db import connection
import pandas as pd

def check_and_fix_database():
    """Check and fix database structure"""
    print("🔧 CHECKING AND FIXING DATABASE")
    print("=" * 35)
    
    try:
        # Check current structure
        with connection.cursor() as cursor:
            cursor.execute("PRAGMA table_info(products_product);")
            columns = cursor.fetchall()
            column_names = [col[1] for col in columns]
            
            excel_columns = [
                'sn', 'product_image', 'cost', 'total_cost', 'link', 'size', 
                'nm', 'plusz_nm', 'price_per_nm', 'price_per_package', 
                'nm_per_package', 'all_package', 'package_need_to_order', 'all_price'
            ]
            
            missing = [col for col in excel_columns if col not in column_names]
            
            if missing:
                print(f"❌ Missing columns: {missing}")
                print("🔄 Creating and applying migrations...")
                
                # Create migrations
                execute_from_command_line(['manage.py', 'makemigrations', 'products'])
                execute_from_command_line(['manage.py', 'makemigrations', 'apartments'])
                
                # Apply migrations
                execute_from_command_line(['manage.py', 'migrate'])
                
                # Verify
                cursor.execute("PRAGMA table_info(products_product);")
                new_columns = cursor.fetchall()
                new_column_names = [col[1] for col in new_columns]
                
                still_missing = [col for col in excel_columns if col not in new_column_names]
                
                if not still_missing:
                    print("✅ All Excel columns added successfully!")
                    return True
                else:
                    print(f"❌ Still missing: {still_missing}")
                    return False
            else:
                print("✅ All Excel columns already exist!")
                return True
                
    except Exception as e:
        print(f"❌ Database fix failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_excel_file():
    """Test the Excel file structure"""
    print("\n📄 TESTING EXCEL FILE")
    print("=" * 20)
    
    excel_path = "static/apartment-name-demo.xlsx"
    
    try:
        if not os.path.exists(excel_path):
            print(f"❌ Excel file not found: {excel_path}")
            return False
        
        # Read Excel file
        excel_file = pd.ExcelFile(excel_path)
        print(f"✅ Excel file loaded successfully")
        print(f"📋 Sheets: {excel_file.sheet_names}")
        
        # Check each sheet
        for sheet_name in excel_file.sheet_names:
            df = pd.read_excel(excel_path, sheet_name=sheet_name)
            print(f"\n📄 Sheet '{sheet_name}':")
            print(f"   📊 Rows: {len(df)}, Columns: {len(df.columns)}")
            print(f"   📋 Columns: {list(df.columns)}")
            
            # Check for common Excel columns
            common_cols = ['S.N', 'Product Name', 'Room', 'Cost', 'Quantity']
            found_cols = [col for col in common_cols if col in df.columns]
            print(f"   ✅ Found common columns: {found_cols}")
            
            # Show sample data
            if len(df) > 0:
                print(f"   📝 Sample row:")
                first_row = df.iloc[0]
                for col in df.columns[:5]:  # Show first 5 columns
                    value = first_row[col]
                    if pd.notna(value):
                        print(f"      {col}: {value}")
        
        return True
        
    except Exception as e:
        print(f"❌ Excel file test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_import_process():
    """Test the import process with the Excel file"""
    print("\n🧪 TESTING IMPORT PROCESS")
    print("=" * 25)
    
    try:
        from products.import_service import ProductImportService
        from apartments.models import Apartment
        from django.core.files.uploadedfile import SimpleUploadedFile
        
        # Check if we have apartments
        apartments = Apartment.objects.all()
        if not apartments:
            print("❌ No apartments found. Create one first.")
            return False
        
        apartment = apartments.first()
        print(f"✅ Using apartment: {apartment.name}")
        
        # Test with the Excel file
        excel_path = "static/apartment-name-demo.xlsx"
        if not os.path.exists(excel_path):
            print("❌ Excel file not found for testing")
            return False
        
        # Read file content
        with open(excel_path, 'rb') as f:
            file_content = f.read()
        
        # Create uploaded file object
        uploaded_file = SimpleUploadedFile(
            name="apartment-name-demo.xlsx",
            content=file_content,
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        
        # Test import service
        import_service = ProductImportService()
        
        print("🔄 Processing import...")
        result = import_service.process_import(
            file=uploaded_file,
            apartment_id=str(apartment.id),
            user=None
        )
        
        print(f"📊 Import result:")
        print(f"   Success: {result.get('success', False)}")
        print(f"   Total products: {result.get('total_products', 0)}")
        print(f"   Successful: {result.get('successful_imports', 0)}")
        print(f"   Failed: {result.get('failed_imports', 0)}")
        print(f"   Errors: {result.get('errors', [])}")
        
        if result.get('success'):
            print("✅ Import test successful!")
            return True
        else:
            print("❌ Import test failed!")
            for error in result.get('errors', []):
                print(f"   Error: {error}")
            return False
        
    except Exception as e:
        print(f"❌ Import test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def check_data_in_database():
    """Check if data was actually stored"""
    print("\n📊 CHECKING DATABASE DATA")
    print("=" * 25)
    
    try:
        from products.models import Product
        from products.category_models import ProductCategory, ImportSession
        
        # Check products
        products = Product.objects.all()
        print(f"📦 Products in database: {products.count()}")
        
        if products.exists():
            latest_product = products.order_by('-created_at').first()
            print(f"   Latest product: {latest_product.product}")
            print(f"   S.N: {latest_product.sn}")
            print(f"   Cost: {latest_product.cost}")
            print(f"   Room: {latest_product.room}")
        
        # Check categories
        categories = ProductCategory.objects.all()
        print(f"📁 Categories: {categories.count()}")
        
        if categories.exists():
            for category in categories:
                print(f"   📂 {category.name} ({category.product_count} products)")
        
        # Check import sessions
        sessions = ImportSession.objects.all()
        print(f"📥 Import sessions: {sessions.count()}")
        
        if sessions.exists():
            latest_session = sessions.order_by('-started_at').first()
            print(f"   Latest: {latest_session.file_name} - {latest_session.status}")
            print(f"   Products: {latest_session.successful_imports}/{latest_session.total_products}")
        
        return True
        
    except Exception as e:
        print(f"❌ Database check failed: {e}")
        return False

def main():
    """Main fix function"""
    print("🚀 EXCEL IMPORT COMPLETE FIX")
    print("=" * 30)
    
    # Step 1: Fix database
    db_fixed = check_and_fix_database()
    
    # Step 2: Test Excel file
    excel_ok = test_excel_file()
    
    # Step 3: Test import process
    import_ok = False
    if db_fixed and excel_ok:
        import_ok = test_import_process()
    
    # Step 4: Check final data
    data_ok = check_data_in_database()
    
    # Summary
    print("\n📊 FIX SUMMARY")
    print("=" * 15)
    print(f"Database Fixed: {'✅' if db_fixed else '❌'}")
    print(f"Excel File OK: {'✅' if excel_ok else '❌'}")
    print(f"Import Process: {'✅' if import_ok else '❌'}")
    print(f"Data in DB: {'✅' if data_ok else '❌'}")
    
    if all([db_fixed, excel_ok, import_ok]):
        print("\n🎉 EXCEL IMPORT FULLY FIXED!")
        print("\n✅ What works now:")
        print("   • Database has all Excel columns")
        print("   • Excel file can be read")
        print("   • Import process works")
        print("   • Data is stored correctly")
        
        print("\n🚀 Try importing again from frontend!")
    else:
        print("\n⚠️  Some issues remain:")
        if not db_fixed:
            print("   • Database structure needs fixing")
        if not excel_ok:
            print("   • Excel file has issues")
        if not import_ok:
            print("   • Import process failing")
        
        print("\n🔧 Manual steps:")
        print("1. python manage.py makemigrations products")
        print("2. python manage.py migrate")
        print("3. Check Excel file format")
        print("4. Test import endpoint manually")

if __name__ == "__main__":
    main()
