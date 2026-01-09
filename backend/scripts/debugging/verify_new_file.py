#!/usr/bin/env python
"""
Verify the new demo file has proper image columns
"""
import pandas as pd
import os

def verify_new_file():
    print("🔍 VERIFYING NEW DEMO FILE")
    print("=" * 30)
    
    # Check both files
    files_to_check = [
        ('demo_with_images.xlsx', 'NEW file (should have images)'),
        ('static/apartment-name-demo.xlsx', 'OLD file (no images)')
    ]
    
    for filename, description in files_to_check:
        print(f"\n📄 {description}")
        print(f"File: {filename}")
        
        if os.path.exists(filename):
            print("✅ File exists")
            
            try:
                excel_data = pd.ExcelFile(filename)
                print(f"📋 Sheets: {excel_data.sheet_names}")
                
                total_products = 0
                has_image_column = False
                
                for sheet_name in excel_data.sheet_names:
                    df = pd.read_excel(filename, sheet_name=sheet_name)
                    total_products += len(df)
                    
                    print(f"\n   Sheet '{sheet_name}':")
                    print(f"   • Products: {len(df)}")
                    print(f"   • Columns: {list(df.columns)}")
                    
                    # Check for image column
                    image_cols = [col for col in df.columns if 'image' in str(col).lower()]
                    if image_cols:
                        has_image_column = True
                        print(f"   ✅ Image columns: {image_cols}")
                        
                        # Show sample image URLs
                        for img_col in image_cols:
                            sample_urls = df[img_col].dropna().head(2).tolist()
                            for i, url in enumerate(sample_urls, 1):
                                print(f"      Sample {i}: {url}")
                    else:
                        print(f"   ❌ No image columns found")
                
                print(f"\n📊 Summary:")
                print(f"   • Total products: {total_products}")
                print(f"   • Has image column: {'✅ YES' if has_image_column else '❌ NO'}")
                
            except Exception as e:
                print(f"❌ Error reading file: {e}")
        else:
            print("❌ File not found")
    
    print(f"\n💡 RECOMMENDATION:")
    print(f"Import 'demo_with_images.xlsx' (5 products with images)")
    print(f"NOT 'apartment-name-demo.xlsx' (9 products without images)")

if __name__ == "__main__":
    verify_new_file()
