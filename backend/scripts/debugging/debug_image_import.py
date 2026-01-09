#!/usr/bin/env python
"""
Debug image import process
"""
import os
import sys
import django
import pandas as pd

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.import_service import ProductImportService
from products.models import Product
from apartments.models import Apartment
from clients.models import Client

def debug_image_import():
    """Debug the image import process"""
    print("🔍 DEBUGGING IMAGE IMPORT")
    print("=" * 30)
    
    # Check if sample Excel exists
    excel_file = 'sample_products_with_images.xlsx'
    if not os.path.exists(excel_file):
        print(f"❌ Sample Excel file not found: {excel_file}")
        return False
    
    print(f"✅ Found Excel file: {excel_file}")
    
    # Read the Excel file to see what's in it
    try:
        excel_data = pd.ExcelFile(excel_file)
        print(f"📊 Sheets: {excel_data.sheet_names}")
        
        for sheet_name in excel_data.sheet_names:
            df = pd.read_excel(excel_file, sheet_name=sheet_name)
            print(f"\n📋 Sheet: {sheet_name}")
            print(f"   • Rows: {len(df)}")
            print(f"   • Columns: {list(df.columns)}")
            
            # Check for image columns
            image_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['image', 'photo', 'picture'])]
            print(f"   • Image columns: {image_columns}")
            
            if image_columns:
                for img_col in image_columns:
                    sample_values = df[img_col].dropna().head(3).tolist()
                    print(f"     - {img_col}: {sample_values}")
    
    except Exception as e:
        print(f"❌ Error reading Excel: {e}")
        return False
    
    # Test the column mapping
    print(f"\n🗂️  TESTING COLUMN MAPPING")
    print("-" * 25)
    
    service = ProductImportService()
    
    # Test the column mapping from the service
    column_mapping = {
        'sn': ['s.n', 'sn', 'serial_number', 'number', 'no'],
        'room': ['room', 'location', 'area'],
        'product_name': ['product_name', 'product', 'name', 'item', 'item_name', 'product name'],
        'product_image': ['product_image', 'product image', 'image', 'photo', 'picture'],
        'image_url': ['image_url', 'photo_url', 'picture_url'],
    }
    
    # Simulate processing the first sheet
    df = pd.read_excel(excel_file, sheet_name=excel_data.sheet_names[0])
    df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')
    
    print(f"📝 Normalized columns: {list(df.columns)}")
    
    # Test column mapping
    normalized_columns = {}
    for standard_name, variations in column_mapping.items():
        for col in df.columns:
            if col in variations:
                normalized_columns[col] = standard_name
                break
    
    print(f"🔗 Column mappings found: {normalized_columns}")
    
    # Test extracting data from first row
    if len(df) > 0:
        first_row = df.iloc[0]
        print(f"\n🧪 Testing first row extraction:")
        
        # Test image extraction
        image_url = None
        for col_name, mapped_name in normalized_columns.items():
            if mapped_name in ['product_image', 'image_url'] and col_name in first_row.index:
                value = first_row[col_name]
                if pd.notna(value):
                    image_url = str(value).strip()
                    print(f"   • Found image in column '{col_name}': {image_url}")
                    break
        
        if not image_url:
            print(f"   ❌ No image URL found in first row")
            print(f"   📋 Row data: {first_row.to_dict()}")
        else:
            print(f"   ✅ Image URL extracted: {image_url}")
    
    return True

def test_actual_import():
    """Test actual import process"""
    print(f"\n🚀 TESTING ACTUAL IMPORT")
    print("=" * 25)
    
    try:
        # Create test client and apartment
        client, _ = Client.objects.get_or_create(
            name="Image Test Client",
            defaults={'email': 'test@example.com', 'phone': '123-456-7890'}
        )
        
        apartment, created = Apartment.objects.get_or_create(
            name="Image Test Apartment",
            defaults={
                'client': client,
                'type': 'furnishing',
                'address': 'Test Address',
                'status': 'Planning',
                'start_date': '2024-01-01',
                'due_date': '2024-12-31',
            }
        )
        
        print(f"✅ Test apartment: {apartment.name} (Created: {created})")
        
        # Test import
        service = ProductImportService()
        
        with open('sample_products_with_images.xlsx', 'rb') as file:
            result = service.process_import(file, apartment.id)
            
        print(f"📊 Import result: {result}")
        
        # Check products created
        products = Product.objects.filter(apartment=apartment)
        print(f"📦 Products created: {products.count()}")
        
        for product in products[:3]:
            print(f"   • {product.product}")
            print(f"     - image_url: '{product.image_url}'")
            print(f"     - product_image: '{product.product_image}'")
        
        return True
        
    except Exception as e:
        print(f"❌ Import test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚀 IMAGE IMPORT DEBUG\n")
    
    success1 = debug_image_import()
    success2 = test_actual_import() if success1 else False
    
    if success1 and success2:
        print(f"\n🎉 DEBUG COMPLETE!")
    else:
        print(f"\n❌ DEBUG FAILED!")
    
    print(f"\n✅ Debug complete!")
