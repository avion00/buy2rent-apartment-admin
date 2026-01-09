#!/usr/bin/env python
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

import pandas as pd

def show_demo_structure():
    excel_file = 'static/apartment-name-demo.xlsx'
    
    if not os.path.exists(excel_file):
        print("❌ Demo Excel file not found!")
        return
    
    print("🔍 DEMO EXCEL STRUCTURE:")
    print("=" * 30)
    
    try:
        excel_data = pd.ExcelFile(excel_file)
        
        for sheet_name in excel_data.sheet_names:
            df = pd.read_excel(excel_file, sheet_name=sheet_name)
            
            print(f"\n📋 Sheet: {sheet_name}")
            print(f"   Rows: {len(df)}")
            print(f"   Columns: {list(df.columns)}")
            
            # Show sample data
            if len(df) > 0:
                print(f"   Sample row 1:")
                for col in df.columns:
                    value = df.iloc[0][col]
                    if pd.notna(value):
                        print(f"      {col}: {str(value)[:50]}")
            
            # Check for potential image columns
            potential_image_cols = []
            for col in df.columns:
                col_str = str(col).lower()
                if any(word in col_str for word in ['image', 'photo', 'picture', 'url', 'link']):
                    potential_image_cols.append(col)
            
            if potential_image_cols:
                print(f"   🖼️  Potential image columns: {potential_image_cols}")
            else:
                print(f"   ❌ No image-related columns found")
        
        print(f"\n💡 RECOMMENDATION:")
        if not any('image' in str(col).lower() for sheet in excel_data.sheet_names for col in pd.read_excel(excel_file, sheet_name=sheet).columns):
            print(f"   Your Excel file has NO image columns!")
            print(f"   Add a column called 'Image' or 'Product Image'")
            print(f"   Fill it with image URLs like:")
            print(f"   https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=YourProduct")
        
    except Exception as e:
        print(f"❌ Error reading Excel: {e}")

if __name__ == "__main__":
    show_demo_structure()
