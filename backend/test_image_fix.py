#!/usr/bin/env python
"""
Test the image import fix
"""
import os
import sys
import django
import pandas as pd

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.import_service import ProductImportService

def test_image_fix():
    """Test the image import fix"""
    print("🧪 TESTING IMAGE IMPORT FIX")
    print("=" * 30)
    
    # Test Excel processing
    excel_file = 'sample_products_with_images.xlsx'
    if not os.path.exists(excel_file):
        print(f"❌ Excel file not found: {excel_file}")
        return False
    
    excel_data = pd.ExcelFile(excel_file)
    service = ProductImportService()
    
    for sheet_name in excel_data.sheet_names:
        print(f"\n📋 Testing Sheet: {sheet_name}")
        df = pd.read_excel(excel_file, sheet_name=sheet_name)
        
        # Show original columns
        print(f"   • Original columns: {list(df.columns)}")
        
        # Normalize columns like the service does
        df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')
        print(f"   • Normalized columns: {list(df.columns)}")
        
        # Test column mapping
        column_mapping = {
            'sn': ['s.n', 'sn', 'serial_number', 'number', 'no'],
            'room': ['room', 'location', 'area'],
            'product_name': ['product_name', 'product', 'name', 'item', 'item_name', 'product name'],
            'product_image': ['product_image', 'product image', 'image', 'photo', 'picture', 'image_url', 'photo_url', 'picture_url'],
            'description': ['description', 'desc', 'details', 'product_description'],
            'sku': ['sku', 'product_code', 'item_code', 'code'],
            'quantity': ['quantity', 'qty', 'amount', 'count'],
            'cost': ['cost', 'price', 'unit_price'],
            'total_cost': ['total_cost', 'total cost', 'total_price', 'total price'],
            'link': ['link', 'url', 'vendor_link', 'product_link'],
            'size': ['size', 'dimensions', 'measurements'],
            'nm': ['nm', 'square_meter', 'sqm'],
            'plusz_nm': ['plusz_nm', 'plusz nm', 'plus_nm', 'plus nm', 'extra_nm'],
            'price_per_nm': ['price/nm', 'price_per_nm', 'price per nm'],
            'price_per_package': ['price/package', 'price_per_package', 'package_price'],
            'nm_per_package': ['nm/package', 'nm_per_package', 'nm per package'],
            'all_package': ['all_package', 'all package', 'total_packages'],
            'package_need_to_order': ['package_need_to_order', 'package need to order', 'packages_to_order'],
            'all_price': ['all_price', 'all price', 'total_amount', 'final_price'],
            'brand': ['brand', 'manufacturer', 'make'],
            'model': ['model', 'model_number', 'part_number'],
            'color': ['color', 'colour'],
            'material': ['material', 'fabric', 'composition'],
            'weight': ['weight'],
            'vendor_link': ['vendor_link', 'supplier_link'],
        }
        
        # Create normalized mapping
        normalized_columns = {}
        for standard_name, variations in column_mapping.items():
            for col in df.columns:
                if col in variations:
                    normalized_columns[col] = standard_name
                    break
        
        print(f"   • Column mappings: {normalized_columns}")
        
        # Check image mappings specifically
        image_mappings = {k: v for k, v in normalized_columns.items() if v == 'product_image'}
        print(f"   • Image mappings: {image_mappings}")
        
        # Test each row
        for index, row in df.iterrows():
            print(f"\n   🔍 Row {index + 1}:")
            
            # Test image extraction
            image_url = ''
            for col_name, mapped_name in normalized_columns.items():
                if mapped_name == 'product_image' and col_name in row.index:
                    value = row[col_name]
                    if pd.notna(value) and str(value).strip():
                        image_url = str(value).strip()
                        print(f"      ✅ Found image in '{col_name}': {image_url}")
                        break
            
            if not image_url:
                print(f"      ❌ No image URL found")
                print(f"      📋 Available data: {dict(row)}")
            else:
                print(f"      🎯 Final image_url: {image_url}")
    
    return True

if __name__ == "__main__":
    print("🚀 IMAGE FIX TEST\n")
    
    try:
        test_image_fix()
        print(f"\n🎉 Test complete!")
        print(f"\n📋 NEXT STEPS:")
        print("1. Delete existing products without images")
        print("2. Re-import the Excel file")
        print("3. Check admin and frontend for images")
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
