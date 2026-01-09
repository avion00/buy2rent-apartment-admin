#!/usr/bin/env python
"""
Test the updated Excel file for image content
"""
import pandas as pd
import os

def test_updated_excel():
    print("🔍 TESTING UPDATED EXCEL FILE")
    print("=" * 35)
    
    excel_file = 'static/aaaaaaaaaapartment-name-demo.xlsx'
    
    if not os.path.exists(excel_file):
        print(f"❌ File not found: {excel_file}")
        return False
    
    print(f"✅ Found: {excel_file}")
    
    try:
        excel_data = pd.ExcelFile(excel_file)
        print(f"📋 Sheets: {excel_data.sheet_names}")
        
        total_products = 0
        total_images = 0
        
        for sheet_name in excel_data.sheet_names:
            df = pd.read_excel(excel_file, sheet_name=sheet_name)
            
            if len(df) == 0:
                print(f"\n📋 Sheet '{sheet_name}': EMPTY")
                continue
                
            print(f"\n📋 Sheet: {sheet_name}")
            print(f"   • Products: {len(df)}")
            print(f"   • Columns: {list(df.columns)}")
            
            total_products += len(df)
            
            # Check for image columns
            image_columns = []
            for col in df.columns:
                if any(keyword in str(col).lower() for keyword in ['image', 'photo', 'picture']):
                    image_columns.append(col)
            
            if image_columns:
                print(f"   ✅ Image columns found: {image_columns}")
                
                for img_col in image_columns:
                    print(f"\n   🖼️  Column '{img_col}' analysis:")
                    
                    # Check content
                    image_data = df[img_col]
                    non_null = image_data.dropna()
                    
                    if len(non_null) > 0:
                        # Filter out empty strings
                        non_empty = non_null[non_null.astype(str).str.strip() != '']
                        
                        print(f"      • Total cells: {len(image_data)}")
                        print(f"      • Non-null: {len(non_null)}")
                        print(f"      • Non-empty: {len(non_empty)}")
                        
                        if len(non_empty) > 0:
                            print(f"      ✅ HAS IMAGE DATA!")
                            total_images += len(non_empty)
                            
                            # Show samples
                            print(f"      📋 Sample image URLs:")
                            for i, value in enumerate(non_empty.head(5), 1):
                                value_str = str(value)
                                if len(value_str) > 80:
                                    value_str = value_str[:80] + "..."
                                print(f"         {i}. {value_str}")
                                
                                # Check if it looks like a valid URL
                                if 'http' in str(value).lower():
                                    print(f"            ✅ Looks like a valid URL")
                                else:
                                    print(f"            ⚠️  Not a URL - might be filename/description")
                        else:
                            print(f"      ❌ All image cells are empty")
                    else:
                        print(f"      ❌ All image cells are null/empty")
            else:
                print(f"   ❌ No image columns found")
        
        # Summary
        print(f"\n📊 OVERALL SUMMARY:")
        print(f"   • Total products: {total_products}")
        print(f"   • Products with images: {total_images}")
        print(f"   • Image coverage: {(total_images/total_products*100):.1f}%" if total_products > 0 else "   • No products found")
        
        if total_images > 0:
            print(f"\n🎉 SUCCESS! Excel file has image data")
            print(f"   Ready for import testing!")
            return True
        else:
            print(f"\n❌ NO IMAGE DATA FOUND")
            print(f"   Excel file still needs image URLs in the image columns")
            return False
            
    except Exception as e:
        print(f"❌ Error reading Excel file: {e}")
        import traceback
        traceback.print_exc()
        return False

def suggest_next_steps(has_images):
    print(f"\n💡 NEXT STEPS:")
    print("=" * 15)
    
    if has_images:
        print(f"1. ✅ Excel file is ready!")
        print(f"2. 🚀 Import via frontend")
        print(f"3. 🔍 Check admin dashboard for thumbnails")
        print(f"4. 🧪 Run: python verify_import_results.py")
    else:
        print(f"1. ✏️  Add image URLs to the 'Product Image' column")
        print(f"2. 💡 Use URLs like: https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=YourProduct")
        print(f"3. 💾 Save the Excel file")
        print(f"4. 🔄 Test again")

if __name__ == "__main__":
    print("🚀 UPDATED EXCEL FILE TEST\n")
    
    try:
        has_images = test_updated_excel()
        suggest_next_steps(has_images)
        
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
    
    print(f"\n✅ Test complete!")
