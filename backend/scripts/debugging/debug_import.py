#!/usr/bin/env python
"""
Debug Excel import process
"""
import os
import sys
import django
import pandas as pd

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection
from products.models import Product
from products.category_models import ProductCategory, ImportSession

def check_database_structure():
    """Check if database has Excel columns"""
    print("🔍 CHECKING DATABASE STRUCTURE")
    print("=" * 35)
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("PRAGMA table_info(products_product);")
            columns = cursor.fetchall()
            column_names = [col[1] for col in columns]
            
            excel_columns = [
                'sn', 'product_image', 'cost', 'total_cost', 'link', 'size', 
                'nm', 'plusz_nm', 'price_per_nm', 'price_per_package', 
                'nm_per_package', 'all_package', 'package_need_to_order', 'all_price'
            ]
            
            print(f"📊 Total columns in products_product: {len(column_names)}")
            print("\n✅ Existing Excel columns:")
            found_excel = []
            for col in excel_columns:
                if col in column_names:
                    print(f"   ✅ {col}")
                    found_excel.append(col)
                else:
                    print(f"   ❌ {col} (MISSING)")
            
            print(f"\n📈 Excel columns found: {len(found_excel)}/{len(excel_columns)}")
            
            if len(found_excel) < len(excel_columns):
                print("\n⚠️  MIGRATIONS NEEDED!")
                return False
            else:
                print("\n✅ Database structure is ready!")
                return True
                
    except Exception as e:
        print(f"❌ Database check failed: {e}")
        return False

def check_existing_data():
    """Check existing data in database"""
    print("\n📊 CHECKING EXISTING DATA")
    print("=" * 25)
    
    try:
        # Check products
        products_count = Product.objects.count()
        print(f"📦 Products in database: {products_count}")
        
        # Check categories
        categories_count = ProductCategory.objects.count()
        print(f"📁 Categories in database: {categories_count}")
        
        # Check import sessions
        sessions_count = ImportSession.objects.count()
        print(f"📥 Import sessions: {sessions_count}")
        
        if sessions_count > 0:
            print("\n📋 Recent import sessions:")
            recent_sessions = ImportSession.objects.order_by('-started_at')[:3]
            for session in recent_sessions:
                print(f"   📄 {session.file_name} - {session.status} - {session.successful_imports} products")
        
        return True
        
    except Exception as e:
        print(f"❌ Data check failed: {e}")
        return False

def examine_excel_file():
    """Examine the Excel file structure"""
    print("\n📄 EXAMINING EXCEL FILE")
    print("=" * 25)
    
    excel_path = "static/apartment-name-demo.xlsx"
    
    try:
        if not os.path.exists(excel_path):
            print(f"❌ Excel file not found: {excel_path}")
            return False
        
        print(f"✅ Excel file found: {excel_path}")
        print(f"📊 File size: {os.path.getsize(excel_path)} bytes")
        
        # Try to read Excel file
        try:
            # Read all sheets
            excel_file = pd.ExcelFile(excel_path)
            sheet_names = excel_file.sheet_names
            print(f"📋 Sheets found: {len(sheet_names)}")
            
            for sheet_name in sheet_names:
                print(f"\n📄 Sheet: {sheet_name}")
                df = pd.read_excel(excel_path, sheet_name=sheet_name)
                print(f"   📊 Rows: {len(df)}, Columns: {len(df.columns)}")
                print(f"   📋 Column names: {list(df.columns)[:5]}{'...' if len(df.columns) > 5 else ''}")
                
                # Show first few rows
                if len(df) > 0:
                    print(f"   📝 Sample data:")
                    for i, row in df.head(2).iterrows():
                        print(f"      Row {i+1}: {dict(row)}")
                        break  # Just show first row
            
            return True
            
        except Exception as e:
            print(f"❌ Failed to read Excel file: {e}")
            return False
            
    except Exception as e:
        print(f"❌ Excel examination failed: {e}")
        return False

def test_import_service():
    """Test the import service"""
    print("\n🔧 TESTING IMPORT SERVICE")
    print("=" * 25)
    
    try:
        from products.import_service import ProductImportService
        
        service = ProductImportService()
        print("✅ ProductImportService initialized")
        
        # Test column mapping
        test_columns = ['S.N', 'Product Name', 'Room', 'Cost', 'Total Cost', 'Quantity']
        print(f"\n🗺️  Testing column mapping for: {test_columns}")
        
        # Simulate column normalization
        normalized = [col.strip().lower().replace(' ', '_').replace('.', '') for col in test_columns]
        print(f"📝 Normalized columns: {normalized}")
        
        return True
        
    except Exception as e:
        print(f"❌ Import service test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def suggest_fixes():
    """Suggest fixes based on findings"""
    print("\n🔧 SUGGESTED FIXES")
    print("=" * 15)
    
    print("1. Create and apply migrations:")
    print("   python manage.py makemigrations products")
    print("   python manage.py makemigrations apartments")
    print("   python manage.py migrate")
    
    print("\n2. Check import endpoint:")
    print("   Test POST /api/products/import/ manually")
    
    print("\n3. Check frontend import code:")
    print("   Verify file upload and API call")
    
    print("\n4. Check Django logs:")
    print("   Look for import errors in terminal")

if __name__ == "__main__":
    print("🚀 EXCEL IMPORT DEBUGGER")
    print("=" * 25)
    
    # Run all checks
    db_ok = check_database_structure()
    data_ok = check_existing_data()
    excel_ok = examine_excel_file()
    service_ok = test_import_service()
    
    print("\n📊 SUMMARY")
    print("=" * 10)
    print(f"Database Structure: {'✅' if db_ok else '❌'}")
    print(f"Existing Data: {'✅' if data_ok else '❌'}")
    print(f"Excel File: {'✅' if excel_ok else '❌'}")
    print(f"Import Service: {'✅' if service_ok else '❌'}")
    
    if not all([db_ok, excel_ok, service_ok]):
        suggest_fixes()
    else:
        print("\n🎉 All checks passed! Import should work.")
        print("\nIf import still fails, check:")
        print("- Frontend console for errors")
        print("- Django server logs")
        print("- Network requests in browser dev tools")
