#!/usr/bin/env python
"""
Debug why the import process is failing
"""
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.category_models import ImportSession
from products.models import Product
import pandas as pd

def debug_failed_import():
    """Debug the failed import session"""
    print("🔍 DEBUGGING FAILED IMPORT")
    print("=" * 25)
    
    try:
        # Get the failed import session
        failed_session = ImportSession.objects.filter(status='failed').order_by('-started_at').first()
        
        if not failed_session:
            print("❌ No failed import sessions found")
            return
        
        print(f"📄 Failed session: {failed_session.file_name}")
        print(f"📊 Status: {failed_session.status}")
        print(f"📈 Products: {failed_session.successful_imports}/{failed_session.total_products}")
        print(f"🕒 Started: {failed_session.started_at}")
        print(f"🕒 Completed: {failed_session.completed_at}")
        
        # Check error log
        if failed_session.error_log:
            print(f"\n❌ Error Log:")
            if isinstance(failed_session.error_log, list):
                for i, error in enumerate(failed_session.error_log, 1):
                    print(f"   {i}. {error}")
            else:
                print(f"   {failed_session.error_log}")
        else:
            print("\n⚠️  No error log found")
        
        return failed_session
        
    except Exception as e:
        print(f"❌ Debug failed: {e}")
        return None

def test_excel_reading():
    """Test reading the Excel file directly"""
    print("\n📄 TESTING EXCEL FILE READING")
    print("=" * 30)
    
    excel_path = "static/apartment-name-demo.xlsx"
    
    try:
        if not os.path.exists(excel_path):
            print(f"❌ Excel file not found: {excel_path}")
            return False
        
        # Read Excel file
        excel_file = pd.ExcelFile(excel_path)
        print(f"✅ Excel file loaded")
        print(f"📋 Sheets: {excel_file.sheet_names}")
        
        for sheet_name in excel_file.sheet_names:
            print(f"\n📄 Sheet: {sheet_name}")
            df = pd.read_excel(excel_path, sheet_name=sheet_name)
            print(f"   📊 Shape: {df.shape}")
            print(f"   📋 Columns: {list(df.columns)}")
            
            # Check for empty data
            if len(df) == 0:
                print("   ⚠️  Sheet is empty!")
                continue
            
            # Show first row
            print(f"   📝 First row data:")
            first_row = df.iloc[0]
            for col in df.columns:
                value = first_row[col]
                if pd.notna(value) and str(value).strip():
                    print(f"      {col}: {value}")
                else:
                    print(f"      {col}: [EMPTY]")
            
            # Test column normalization
            print(f"   🔄 Normalized columns:")
            normalized = df.columns.str.strip().str.lower().str.replace(' ', '_')
            for orig, norm in zip(df.columns, normalized):
                print(f"      '{orig}' → '{norm}'")
        
        return True
        
    except Exception as e:
        print(f"❌ Excel reading failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_column_mapping():
    """Test the column mapping logic"""
    print("\n🗺️  TESTING COLUMN MAPPING")
    print("=" * 25)
    
    try:
        # Test with sample Excel columns
        excel_path = "static/apartment-name-demo.xlsx"
        if not os.path.exists(excel_path):
            print("❌ Excel file not found")
            return False
        
        # Read first sheet
        df = pd.read_excel(excel_path, sheet_name=0)
        original_columns = list(df.columns)
        
        # Normalize columns (same as import service)
        df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')
        normalized_columns = list(df.columns)
        
        print(f"📋 Original columns: {original_columns}")
        print(f"🔄 Normalized columns: {normalized_columns}")
        
        # Test mapping (same as import service)
        column_mapping = {
            'sn': ['s.n', 'sn', 'serial_number', 'number', 'no'],
            'room': ['room', 'location', 'area'],
            'product_name': ['product', 'name', 'item', 'product_name', 'item_name', 'product name'],
            'cost': ['cost', 'price', 'unit_price'],
            'total_cost': ['total_cost', 'total cost', 'total_price', 'total price'],
            'quantity': ['quantity', 'qty', 'amount', 'count'],
        }
        
        # Find mappings
        found_mappings = {}
        for standard_name, variations in column_mapping.items():
            for col in normalized_columns:
                if col in variations:
                    found_mappings[col] = standard_name
                    break
        
        print(f"\n✅ Found mappings:")
        for excel_col, standard_name in found_mappings.items():
            print(f"   '{excel_col}' → {standard_name}")
        
        print(f"\n❌ Unmapped columns:")
        unmapped = [col for col in normalized_columns if col not in found_mappings]
        for col in unmapped:
            print(f"   '{col}'")
        
        return len(found_mappings) > 0
        
    except Exception as e:
        print(f"❌ Column mapping test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_data_extraction():
    """Test data extraction from Excel"""
    print("\n🔧 TESTING DATA EXTRACTION")
    print("=" * 25)
    
    try:
        excel_path = "static/apartment-name-demo.xlsx"
        if not os.path.exists(excel_path):
            print("❌ Excel file not found")
            return False
        
        # Read and process like import service
        df = pd.read_excel(excel_path, sheet_name=0)
        print(f"📊 Loaded {len(df)} rows")
        
        if len(df) == 0:
            print("❌ No data in Excel file")
            return False
        
        # Normalize columns
        df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')
        
        # Test first row extraction
        first_row = df.iloc[0]
        print(f"\n📝 First row data:")
        
        extracted_data = {}
        for col in df.columns:
            value = first_row[col]
            if pd.notna(value):
                extracted_data[col] = str(value).strip()
                print(f"   {col}: '{value}'")
            else:
                print(f"   {col}: [EMPTY]")
        
        # Test required fields
        required_fields = ['product_name', 'sn', 'room', 'cost']
        print(f"\n🔍 Checking required fields:")
        for field in required_fields:
            found = False
            for col in df.columns:
                if field in col or col in field:
                    print(f"   ✅ {field} → found in '{col}'")
                    found = True
                    break
            if not found:
                print(f"   ❌ {field} → not found")
        
        return len(extracted_data) > 0
        
    except Exception as e:
        print(f"❌ Data extraction test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def suggest_fixes():
    """Suggest specific fixes"""
    print("\n🔧 SUGGESTED FIXES")
    print("=" * 15)
    
    print("1. Check Excel file format:")
    print("   - Ensure first row has column headers")
    print("   - Check for empty rows at the top")
    print("   - Verify data starts from row 2")
    
    print("\n2. Check column names in Excel:")
    print("   - 'S.N' or 'Serial Number' for serial numbers")
    print("   - 'Product Name' or 'Product' for product names")
    print("   - 'Room' for room information")
    print("   - 'Cost' or 'Price' for pricing")
    
    print("\n3. Debug import service:")
    print("   - Add logging to import_service.py")
    print("   - Check for exceptions during data processing")
    print("   - Verify database field types match data")
    
    print("\n4. Manual test:")
    print("   - Create a simple Excel with 1-2 rows")
    print("   - Test with minimal columns first")
    print("   - Check Django logs for detailed errors")

def main():
    """Main debug function"""
    print("🔍 IMPORT FAILURE DEBUGGER")
    print("=" * 25)
    
    # Debug failed session
    failed_session = debug_failed_import()
    
    # Test Excel reading
    excel_ok = test_excel_reading()
    
    # Test column mapping
    mapping_ok = test_column_mapping()
    
    # Test data extraction
    extraction_ok = test_data_extraction()
    
    # Summary
    print("\n📊 DEBUG SUMMARY")
    print("=" * 15)
    print(f"Failed Session Found: {'✅' if failed_session else '❌'}")
    print(f"Excel Reading: {'✅' if excel_ok else '❌'}")
    print(f"Column Mapping: {'✅' if mapping_ok else '❌'}")
    print(f"Data Extraction: {'✅' if extraction_ok else '❌'}")
    
    if not all([excel_ok, mapping_ok, extraction_ok]):
        suggest_fixes()
    else:
        print("\n✅ All tests passed!")
        print("The issue might be in the database saving process.")
        print("Check Django server logs for detailed error messages.")

if __name__ == "__main__":
    main()
