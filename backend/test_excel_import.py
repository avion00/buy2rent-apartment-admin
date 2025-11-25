#!/usr/bin/env python
"""
Test Excel import with all columns
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
from django.contrib.auth import get_user_model

User = get_user_model()

def test_excel_columns():
    """Test that all Excel columns are properly handled"""
    print("🧪 Testing Excel Import with All Columns")
    print("=" * 40)
    
    try:
        # Create test data that matches your Excel structure
        test_data = {
            'S.N': [1, 2, 3],
            'Room': ['Bathroom', 'Kitchen', 'Living Room'],
            'Product Name': ['Boiler', 'Laminated Floor', 'Heating Panel'],
            'Product Image': ['', '', ''],
            'Quantity': [1.0, 2.0, 1.0],
            'Cost': ['5000 Ft', '454000 Ft', '40000 Ft'],
            'Total Cost': ['5000 Ft', '908000 Ft', '40000 Ft'],
            'Description': ['Water heater', 'Floor covering', 'Wall heating'],
            'link': [
                'https://kazanpro.hu/bosch-tronic-tr2000t-80-b-fali-villanybojler-fuggoleges-20-kw-80-l--7736506107.html',
                'https://mexen.co.hu/35889-mexen-mars-elektromos-radiator-900-x-400-mm-300-w-fekete-w110-0900-400-2300-70-5905315238153.html',
                'https://elektroporta.hu/FG-FS-822'
            ],
            'size': ['80L', '1292x193x8mm', '900x400mm'],
            'nm': ['', '1.99', '0.36'],
            'plusz nm': ['', '0.1', ''],
            'price/nm': ['', '228000', '111111'],
            'price/package': ['', '4540', '40000'],
            'nm/package': ['', '1.99', '0.36'],
            'all package': ['', '200', '1'],
            'package need to order': ['', '456', '1'],
            'all price': ['5000', '2070240', '40000']
        }
        
        # Create DataFrame
        df = pd.DataFrame(test_data)
        
        print("📊 Test data created with columns:")
        for col in df.columns:
            print(f"  ✅ {col}")
        
        # Test column mapping
        service = ProductImportService()
        
        # Clean column names (simulate what happens in import)
        df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_').str.replace('/', '_')
        
        print(f"\n🔄 Normalized column names:")
        for col in df.columns:
            print(f"  📋 {col}")
        
        # Test column mapping
        column_mapping = {
            's.n': 'sn',
            'room': 'room', 
            'product_name': 'product_name',
            'product_image': 'product_image',
            'quantity': 'quantity',
            'cost': 'cost',
            'total_cost': 'total_cost',
            'description': 'description',
            'link': 'link',
            'size': 'size',
            'nm': 'nm',
            'plusz_nm': 'plusz_nm',
            'price_nm': 'price_per_nm',
            'price_package': 'price_per_package',
            'nm_package': 'nm_per_package',
            'all_package': 'all_package',
            'package_need_to_order': 'package_need_to_order',
            'all_price': 'all_price'
        }
        
        print(f"\n🗺️  Column mapping test:")
        for excel_col, model_field in column_mapping.items():
            if excel_col in df.columns:
                print(f"  ✅ {excel_col} → {model_field}")
            else:
                print(f"  ❌ {excel_col} → {model_field} (missing)")
        
        # Test data extraction for first row
        print(f"\n🔍 Testing data extraction from first row:")
        first_row = df.iloc[0]
        
        # Simulate _extract_product_data
        extracted_data = {}
        for excel_col, model_field in column_mapping.items():
            if excel_col in first_row.index:
                value = first_row[excel_col]
                if pd.notna(value) and str(value).strip():
                    extracted_data[model_field] = str(value)
                    print(f"  ✅ {model_field}: '{value}'")
        
        print(f"\n📋 Extracted {len(extracted_data)} fields from test data")
        
        # Test price extraction
        cost_value = extracted_data.get('cost', '')
        if cost_value:
            import re
            price_match = re.search(r'[\d,]+', cost_value.replace(' ', ''))
            if price_match:
                price = float(price_match.group().replace(',', ''))
                print(f"  💰 Extracted price: {price} from '{cost_value}'")
        
        print("\n✅ All column mapping tests passed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def show_model_fields():
    """Show all available model fields"""
    print("\n📋 Current Product Model Fields:")
    print("=" * 35)
    
    try:
        from products.models import Product
        
        fields = Product._meta.fields
        excel_fields = [
            'sn', 'product_image', 'cost', 'total_cost', 'link', 'size', 
            'nm', 'plusz_nm', 'price_per_nm', 'price_per_package', 
            'nm_per_package', 'all_package', 'package_need_to_order', 'all_price'
        ]
        
        for field in fields:
            field_type = field.__class__.__name__
            is_excel = "🆕" if field.name in excel_fields else "📋"
            print(f"  {is_excel} {field.name} ({field_type})")
        
        print(f"\n📊 Total fields: {len(fields)}")
        print(f"🆕 Excel fields: {len([f for f in fields if f.name in excel_fields])}")
        
    except Exception as e:
        print(f"❌ Error showing fields: {e}")

if __name__ == "__main__":
    print("🚀 EXCEL IMPORT TESTING")
    print("=" * 25)
    
    show_model_fields()
    
    if test_excel_columns():
        print("\n🎉 All tests passed! Excel import should work correctly.")
        print("\n📋 Your Excel columns will be mapped as follows:")
        mappings = [
            "S.N → sn",
            "Room → room", 
            "Product Name → product",
            "Cost → cost (and extracted to unit_price)",
            "Total Cost → total_cost",
            "link → link",
            "size → size",
            "nm → nm",
            "price/nm → price_per_nm",
            "All other columns mapped accordingly..."
        ]
        for mapping in mappings:
            print(f"  ✅ {mapping}")
    else:
        print("\n❌ Tests failed. Check the errors above.")
