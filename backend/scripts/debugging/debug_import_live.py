#!/usr/bin/env python
"""
Debug live import to see what's happening with images
"""
import os
import sys
import django
import pandas as pd

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Product
from apartments.models import Apartment
from clients.models import Client
from products.import_service import ProductImportService

def debug_live_import():
    """Debug what's happening during import"""
    print("🔍 DEBUGGING LIVE IMPORT PROCESS")
    print("=" * 40)
    
    # Check current products
    products = Product.objects.all().order_by('-created_at')[:10]
    print(f"📦 Recent Products ({products.count()}):")
    
    for i, product in enumerate(products, 1):
        print(f"   {i}. {product.product}")
        print(f"      • ID: {product.id}")
        print(f"      • Apartment: {product.apartment.name}")
        print(f"      • image_url: '{product.image_url}' (type: {type(product.image_url)})")
        print(f"      • product_image: '{product.product_image}' (type: {type(product.product_image)})")
        print(f"      • Created: {product.created_at}")
        print()
    
    # Test Excel processing manually
    print(f"🧪 MANUAL EXCEL PROCESSING TEST")
    print("-" * 35)
    
    excel_file = 'sample_products_with_images.xlsx'
    if not os.path.exists(excel_file):
        print(f"❌ Excel file not found: {excel_file}")
        return
    
    # Read and process like the import service does
    excel_data = pd.ExcelFile(excel_file)
    
    for sheet_name in excel_data.sheet_names:
        print(f"\n📋 Processing Sheet: {sheet_name}")
        df = pd.read_excel(excel_file, sheet_name=sheet_name)
        
        # Normalize columns like the service does
        df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')
        print(f"   • Normalized columns: {list(df.columns)}")
        
        # Test column mapping
        service = ProductImportService()
        column_mapping = service._create_column_mapping(df.columns)
        print(f"   • Column mapping: {column_mapping}")
        
        # Test first row extraction
        if len(df) > 0:
            first_row = df.iloc[0]
            print(f"\n   🧪 Testing first row:")
            print(f"      • Raw row data: {dict(first_row)}")
            
            # Test _extract_product_data method
            try:
                product_data = service._extract_product_data(first_row, column_mapping)
                print(f"      • Extracted data keys: {list(product_data.keys())}")
                print(f"      • image_url in data: {'image_url' in product_data}")
                print(f"      • image_url value: '{product_data.get('image_url', 'NOT_FOUND')}'")
                
                # Check if image_url has a value
                image_url = product_data.get('image_url')
                if image_url:
                    print(f"      ✅ Image URL found: {image_url}")
                    print(f"      • URL type: {type(image_url)}")
                    print(f"      • URL length: {len(str(image_url))}")
                    print(f"      • Starts with http: {str(image_url).startswith(('http://', 'https://'))}")
                else:
                    print(f"      ❌ No image URL extracted")
                    
                    # Check what image-related data exists
                    image_keys = [k for k in product_data.keys() if 'image' in k.lower()]
                    print(f"      • Image-related keys: {image_keys}")
                    for key in image_keys:
                        print(f"        - {key}: '{product_data[key]}'")
                
            except Exception as e:
                print(f"      ❌ Error extracting data: {e}")
                import traceback
                traceback.print_exc()
    
    # Test image processing directly
    print(f"\n🖼️  TESTING IMAGE PROCESSING")
    print("-" * 30)
    
    if products.exists():
        test_product = products.first()
        print(f"Testing with product: {test_product.product}")
        
        # Test with a known image URL
        test_url = "https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Test+Image"
        print(f"Testing URL: {test_url}")
        
        try:
            service = ProductImportService()
            service._process_product_image(test_product, test_url)
            
            # Refresh from database
            test_product.refresh_from_db()
            print(f"After processing:")
            print(f"   • image_url: '{test_product.image_url}'")
            print(f"   • product_image: '{test_product.product_image}'")
            
        except Exception as e:
            print(f"❌ Image processing failed: {e}")
            import traceback
            traceback.print_exc()
    
    return True

if __name__ == "__main__":
    print("🚀 LIVE IMPORT DEBUG\n")
    
    try:
        debug_live_import()
        print(f"\n✅ Debug complete!")
    except Exception as e:
        print(f"\n❌ Debug failed: {str(e)}")
        import traceback
        traceback.print_exc()
