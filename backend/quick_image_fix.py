#!/usr/bin/env python
"""
Quick fix for image import - identify and fix the column mapping issue
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

def quick_image_fix():
    """Quick diagnosis and fix for image import"""
    print("🔧 QUICK IMAGE IMPORT FIX")
    print("=" * 30)
    
    # Step 1: Check current products
    products = Product.objects.all().order_by('-created_at')[:5]
    
    print(f"📦 Recent Products: {products.count()}")
    for product in products:
        print(f"   • {product.product}")
        print(f"     - image_url: '{product.image_url}'")
        print(f"     - product_image: '{product.product_image}'")
    
    if products.count() == 0:
        print("❌ No products found. Import Excel first.")
        return
    
    # Step 2: Analyze Excel file
    excel_file = 'sample_products_with_images.xlsx'
    if not os.path.exists(excel_file):
        print(f"❌ Excel file not found: {excel_file}")
        return
    
    print(f"\n📊 ANALYZING EXCEL FILE:")
    print("-" * 25)
    
    try:
        excel_data = pd.ExcelFile(excel_file)
        
        for sheet_name in excel_data.sheet_names:
            df = pd.read_excel(excel_file, sheet_name=sheet_name)
            
            print(f"\n📋 Sheet: {sheet_name}")
            print(f"   • Original columns: {list(df.columns)}")
            
            # Check for image URLs in the data
            for col in df.columns:
                if len(df) > 0:
                    sample_value = df.iloc[0][col]
                    if pd.notna(sample_value):
                        sample_str = str(sample_value)
                        if 'http' in sample_str and any(keyword in sample_str.lower() for keyword in ['image', 'placeholder', '.jpg', '.png']):
                            print(f"   🖼️  FOUND IMAGE URL in column '{col}': {sample_str[:60]}...")
                            
                            # This is likely our image column!
                            print(f"   🎯 This column contains image URLs!")
                            
                            # Check all values in this column
                            print(f"   📋 All values in '{col}':")
                            for i, value in enumerate(df[col].dropna(), 1):
                                print(f"      Row {i}: {str(value)[:80]}...")
    
    except Exception as e:
        print(f"❌ Excel analysis failed: {e}")
        return
    
    # Step 3: Test column normalization
    print(f"\n🔄 TESTING COLUMN NORMALIZATION:")
    print("-" * 30)
    
    df = pd.read_excel(excel_file, sheet_name=excel_data.sheet_names[0])
    original_columns = list(df.columns)
    
    # Show normalization process
    print(f"   Original columns: {original_columns}")
    
    df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')
    normalized_columns = list(df.columns)
    
    print(f"   Normalized columns: {normalized_columns}")
    
    # Show mapping
    print(f"   Column transformations:")
    for orig, norm in zip(original_columns, normalized_columns):
        if orig != norm:
            print(f"      '{orig}' → '{norm}'")
    
    # Step 4: Test our column mapping
    print(f"\n🗂️  TESTING COLUMN MAPPING:")
    print("-" * 25)
    
    # Current mapping from import service
    image_variations = ['product_image', 'product image', 'image', 'photo', 'picture', 'image_url', 'photo_url', 'picture_url']
    
    print(f"   Looking for image columns in: {image_variations}")
    print(f"   Available normalized columns: {normalized_columns}")
    
    found_image_columns = []
    for col in normalized_columns:
        if col in image_variations:
            found_image_columns.append(col)
    
    if found_image_columns:
        print(f"   ✅ Found matching columns: {found_image_columns}")
        
        # Test data extraction
        for img_col in found_image_columns:
            print(f"   📋 Data in '{img_col}':")
            for i in range(min(3, len(df))):
                value = df.iloc[i][img_col]
                print(f"      Row {i+1}: {value}")
    else:
        print(f"   ❌ NO MATCHING COLUMNS FOUND!")
        print(f"   🔍 This is the problem!")
        
        # Find potential image columns
        potential_cols = []
        for col in normalized_columns:
            # Check if column name suggests it might contain images
            if any(keyword in col for keyword in ['image', 'photo', 'picture', 'url']):
                potential_cols.append(col)
        
        if potential_cols:
            print(f"   🎯 Potential image columns: {potential_cols}")
            
            # Check their content
            for col in potential_cols:
                sample_value = df.iloc[0][col] if len(df) > 0 else None
                if pd.notna(sample_value) and 'http' in str(sample_value):
                    print(f"      '{col}' contains URLs: {str(sample_value)[:50]}...")
                    
                    # This column should be added to our mapping!
                    print(f"   🔧 SOLUTION: Add '{col}' to image column mapping!")
        else:
            print(f"   🤔 No obvious image columns found")
            
            # Show all column content to help identify
            print(f"   📋 All column content (first row):")
            if len(df) > 0:
                first_row = df.iloc[0]
                for col in df.columns:
                    value = first_row[col]
                    if pd.notna(value):
                        value_str = str(value)
                        if 'http' in value_str:
                            print(f"      '{col}': {value_str[:60]}... ← POTENTIAL IMAGE!")
                        else:
                            print(f"      '{col}': {value_str[:30]}...")

def suggest_fix():
    """Suggest the fix based on analysis"""
    print(f"\n💡 SUGGESTED FIX:")
    print("=" * 15)
    
    print(f"1. The Excel file likely has image URLs in columns that don't match our mapping")
    print(f"2. We need to add the actual column names to our column mapping")
    print(f"3. Run the analysis above to identify the exact column names")
    print(f"4. Update the import service column mapping to include those names")
    
    print(f"\n🔧 QUICK FIX STEPS:")
    print(f"1. Run this script to see the exact column names")
    print(f"2. Update column mapping in import_service.py")
    print(f"3. Re-import the Excel file")
    print(f"4. Check admin dashboard for thumbnails")

if __name__ == "__main__":
    print("🚀 QUICK IMAGE FIX ANALYSIS\n")
    
    try:
        quick_image_fix()
        suggest_fix()
        
    except Exception as e:
        print(f"\n❌ Analysis failed: {str(e)}")
        import traceback
        traceback.print_exc()
    
    print(f"\n✅ Analysis complete!")
