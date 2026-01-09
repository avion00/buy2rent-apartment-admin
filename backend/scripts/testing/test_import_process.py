#!/usr/bin/env python
"""
Test the import process step by step to identify the issue
"""
import os
import sys
import django
import pandas as pd

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.import_service import ProductImportService
from apartments.models import Apartment
from clients.models import Client

def test_import_process():
    """Test the import process step by step"""
    print("🧪 TESTING IMPORT PROCESS STEP BY STEP")
    print("=" * 45)
    
    # Check Excel file
    excel_file = 'sample_products_with_images.xlsx'
    if not os.path.exists(excel_file):
        print(f"❌ Excel file not found: {excel_file}")
        return False
    
    print(f"✅ Excel file found: {excel_file}")
    
    # Step 1: Test pandas reading
    print(f"\n1️⃣  TESTING PANDAS READING")
    print("-" * 25)
    
    try:
        excel_data = pd.ExcelFile(excel_file)
        print(f"   📊 Sheets: {excel_data.sheet_names}")
        
        for sheet_name in excel_data.sheet_names:
            df = pd.read_excel(excel_file, sheet_name=sheet_name)
            print(f"\n   📋 Sheet: {sheet_name}")
            print(f"      • Rows: {len(df)}")
            print(f"      • Original columns: {list(df.columns)}")
            
            # Normalize columns like the service does
            df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')
            print(f"      • Normalized columns: {list(df.columns)}")
            
            # Check first row data
            if len(df) > 0:
                first_row = df.iloc[0]
                print(f"      • First row data:")
                for col in df.columns:
                    value = first_row[col]
                    if pd.notna(value) and str(value).strip():
                        print(f"        - {col}: '{value}'")
                
                # Specifically check image-related columns
                image_related = [col for col in df.columns if any(keyword in col for keyword in ['image', 'photo', 'picture'])]
                if image_related:
                    print(f"      • Image-related columns: {image_related}")
                    for img_col in image_related:
                        value = first_row[img_col]
                        print(f"        - {img_col}: '{value}' (type: {type(value)})")
                else:
                    print(f"      • No image-related columns found")
    
    except Exception as e:
        print(f"   ❌ Pandas reading failed: {e}")
        return False
    
    # Step 2: Test column mapping
    print(f"\n2️⃣  TESTING COLUMN MAPPING")
    print("-" * 25)
    
    try:
        service = ProductImportService()
        
        # Use the same column mapping as in the service
        column_mapping = {
            'sn': ['s.n', 'sn', 'serial_number', 'number', 'no'],
            'room': ['room', 'location', 'area'],
            'product_name': ['product_name', 'product', 'name', 'item', 'item_name', 'product name'],
            'product_image': ['product_image', 'product image', 'image', 'photo', 'picture', 'image_url', 'photo_url', 'picture_url'],
            'description': ['description', 'desc', 'details', 'product_description'],
            'sku': ['sku', 'product_code', 'item_code', 'code'],
            'quantity': ['quantity', 'qty', 'amount', 'count'],
            'cost': ['cost', 'price', 'unit_price'],
        }
        
        # Test mapping with first sheet
        df = pd.read_excel(excel_file, sheet_name=excel_data.sheet_names[0])
        df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')
        
        # Create normalized mapping
        normalized_columns = {}
        for standard_name, variations in column_mapping.items():
            for col in df.columns:
                if col in variations:
                    normalized_columns[col] = standard_name
                    break
        
        print(f"   🗂️  Column mappings found: {normalized_columns}")
        
        # Check image mapping specifically
        image_mappings = {k: v for k, v in normalized_columns.items() if v == 'product_image'}
        print(f"   🖼️  Image mappings: {image_mappings}")
        
        if not image_mappings:
            print(f"   ❌ NO IMAGE COLUMNS MAPPED!")
            print(f"   Available columns: {list(df.columns)}")
            print(f"   Image variations: {column_mapping['product_image']}")
            
            # Check which columns might be image columns
            potential_image_cols = []
            for col in df.columns:
                if any(keyword in col for keyword in ['image', 'photo', 'picture']):
                    potential_image_cols.append(col)
            
            if potential_image_cols:
                print(f"   🔍 Potential image columns not mapped: {potential_image_cols}")
            
            return False
        
    except Exception as e:
        print(f"   ❌ Column mapping failed: {e}")
        return False
    
    # Step 3: Test data extraction
    print(f"\n3️⃣  TESTING DATA EXTRACTION")
    print("-" * 25)
    
    try:
        # Test _extract_product_data method
        first_row = df.iloc[0]
        
        # Simulate the _get_value method
        def get_value(row, column_mapping, field_name, default=''):
            for col_name, mapped_name in column_mapping.items():
                if mapped_name == field_name and col_name in row.index:
                    value = row[col_name]
                    if pd.notna(value):
                        return str(value).strip()
            return default
        
        # Test image extraction specifically
        image_url = get_value(first_row, normalized_columns, 'product_image', '')
        
        print(f"   🖼️  Extracted image_url: '{image_url}'")
        
        if image_url:
            print(f"   ✅ Image URL successfully extracted!")
            print(f"   • Value: {image_url}")
            print(f"   • Length: {len(image_url)}")
            print(f"   • Starts with http: {image_url.startswith(('http://', 'https://'))}")
        else:
            print(f"   ❌ NO IMAGE URL EXTRACTED!")
            
            # Debug why
            print(f"   🔍 Debugging extraction:")
            for col_name, mapped_name in normalized_columns.items():
                if mapped_name == 'product_image':
                    value = first_row[col_name]
                    print(f"      • Column '{col_name}' -> '{value}' (pd.notna: {pd.notna(value)})")
            
            return False
    
    except Exception as e:
        print(f"   ❌ Data extraction failed: {e}")
        return False
    
    # Step 4: Test actual import
    print(f"\n4️⃣  TESTING ACTUAL IMPORT")
    print("-" * 25)
    
    try:
        # Create test apartment
        client, _ = Client.objects.get_or_create(
            name="Debug Test Client",
            defaults={'email': 'debug@example.com', 'phone': '123-456-7890'}
        )
        
        apartment, created = Apartment.objects.get_or_create(
            name="Debug Test Apartment",
            defaults={
                'client': client,
                'type': 'furnishing',
                'address': 'Debug Address',
                'status': 'Planning',
                'start_date': '2024-01-01',
                'due_date': '2024-12-31',
            }
        )
        
        print(f"   🏠 Test apartment: {apartment.name} (Created: {created})")
        
        # Test import service
        with open(excel_file, 'rb') as file:
            result = service.process_import(file, apartment.id)
        
        print(f"   📊 Import result: {result}")
        
        if result.get('success'):
            print(f"   ✅ Import successful!")
            print(f"   • Total products: {result.get('total_products', 0)}")
            print(f"   • Successful imports: {result.get('successful_imports', 0)}")
            print(f"   • Failed imports: {result.get('failed_imports', 0)}")
            
            if result.get('errors'):
                print(f"   ⚠️  Errors: {result['errors']}")
        else:
            print(f"   ❌ Import failed!")
            print(f"   • Errors: {result.get('errors', [])}")
            return False
    
    except Exception as e:
        print(f"   ❌ Import test failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 IMPORT PROCESS TEST\n")
    
    try:
        success = test_import_process()
        
        if success:
            print(f"\n🎉 IMPORT PROCESS TEST PASSED!")
            print(f"   The import should be working correctly")
        else:
            print(f"\n❌ IMPORT PROCESS TEST FAILED!")
            print(f"   Check the specific failure points above")
            
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
    
    print(f"\n✅ Test complete!")
