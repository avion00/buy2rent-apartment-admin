#!/usr/bin/env python
"""
Debug current products to see image field values
"""
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Product
from apartments.models import Apartment

def debug_current_products():
    """Debug current products and their image fields"""
    print("🔍 DEBUGGING CURRENT PRODUCTS")
    print("=" * 35)
    
    # Get all products
    products = Product.objects.all().order_by('-created_at')
    
    print(f"📦 Total Products: {products.count()}")
    
    if products.count() == 0:
        print("❌ No products found. Import Excel file first.")
        return
    
    # Show recent products
    print(f"\n📋 Recent Products:")
    for i, product in enumerate(products[:10], 1):
        print(f"\n{i}. {product.product}")
        print(f"   • ID: {product.id}")
        print(f"   • Apartment: {product.apartment.name}")
        print(f"   • Category: {product.category}")
        print(f"   • image_url: '{product.image_url}' (type: {type(product.image_url)})")
        print(f"   • product_image: '{product.product_image}' (type: {type(product.product_image)})")
        print(f"   • Created: {product.created_at}")
        
        # Check if any image data exists
        has_image_url = bool(product.image_url and str(product.image_url).strip())
        has_product_image = bool(product.product_image and str(product.product_image).strip())
        
        if has_image_url or has_product_image:
            print(f"   ✅ Has image data")
        else:
            print(f"   ❌ No image data")
    
    # Summary
    products_with_image_url = products.exclude(image_url__isnull=True).exclude(image_url='').count()
    products_with_product_image = products.exclude(product_image__isnull=True).exclude(product_image='').count()
    
    print(f"\n📊 SUMMARY:")
    print(f"   • Products with image_url: {products_with_image_url}")
    print(f"   • Products with product_image: {products_with_product_image}")
    
    if products_with_image_url == 0 and products_with_product_image == 0:
        print(f"\n❌ NO IMAGES FOUND IN DATABASE!")
        print(f"   This means the import process is not extracting images")
        
        # Check sample Excel file
        print(f"\n🔍 Let's check the Excel file...")
        excel_file = 'sample_products_with_images.xlsx'
        
        if os.path.exists(excel_file):
            import pandas as pd
            
            try:
                excel_data = pd.ExcelFile(excel_file)
                print(f"   📄 Excel file found: {excel_file}")
                
                for sheet_name in excel_data.sheet_names:
                    df = pd.read_excel(excel_file, sheet_name=sheet_name)
                    print(f"\n   📋 Sheet: {sheet_name}")
                    print(f"      • Original columns: {list(df.columns)}")
                    
                    # Check for image data in cells
                    image_columns = []
                    for col in df.columns:
                        if any(keyword in col.lower() for keyword in ['image', 'photo', 'picture']):
                            image_columns.append(col)
                    
                    if image_columns:
                        print(f"      • Image columns: {image_columns}")
                        
                        for img_col in image_columns:
                            sample_values = df[img_col].dropna().head(3).tolist()
                            print(f"        - {img_col}:")
                            for j, val in enumerate(sample_values, 1):
                                print(f"          Row {j+1}: {val}")
                    else:
                        print(f"      • No image columns found")
                        
            except Exception as e:
                print(f"   ❌ Error reading Excel: {e}")
        else:
            print(f"   ❌ Excel file not found: {excel_file}")

if __name__ == "__main__":
    debug_current_products()
