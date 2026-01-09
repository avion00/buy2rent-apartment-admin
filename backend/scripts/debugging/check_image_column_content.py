#!/usr/bin/env python
"""
Check what's actually in the Product Image columns
"""
import pandas as pd
import os

def check_image_column_content():
    print("🔍 CHECKING PRODUCT IMAGE COLUMN CONTENT")
    print("=" * 45)
    
    excel_file = 'static/apartment-name-demo.xlsx'
    
    if not os.path.exists(excel_file):
        print("❌ File not found")
        return
    
    try:
        excel_data = pd.ExcelFile(excel_file)
        
        for sheet_name in excel_data.sheet_names:
            df = pd.read_excel(excel_file, sheet_name=sheet_name)
            
            if len(df) == 0:
                continue
                
            print(f"\n📋 Sheet: {sheet_name}")
            print(f"   Products: {len(df)}")
            
            # Check Product Image column specifically
            if 'Product Image' in df.columns:
                print(f"   ✅ Has 'Product Image' column")
                
                # Check content
                image_col = df['Product Image']
                non_empty = image_col.dropna()
                non_empty_non_blank = non_empty[non_empty.str.strip() != ''] if len(non_empty) > 0 else []
                
                print(f"   📊 Image column analysis:")
                print(f"      • Total rows: {len(image_col)}")
                print(f"      • Non-null values: {len(non_empty)}")
                print(f"      • Non-empty values: {len(non_empty_non_blank)}")
                
                if len(non_empty_non_blank) > 0:
                    print(f"   🖼️  Sample image values:")
                    for i, value in enumerate(non_empty_non_blank.head(5), 1):
                        print(f"      {i}. {value}")
                else:
                    print(f"   ❌ ALL IMAGE CELLS ARE EMPTY!")
                    
                    # Show what's actually in the first few cells
                    print(f"   🔍 First 5 image cell values:")
                    for i in range(min(5, len(df))):
                        value = df.iloc[i]['Product Image']
                        print(f"      Row {i+1}: '{value}' (type: {type(value)})")
            else:
                print(f"   ❌ No 'Product Image' column")
                print(f"   Available columns: {list(df.columns)}")
    
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_image_column_content()
