import pandas as pd
import os

# Test the updated Excel file
excel_file = 'static/aaaaaaaaaapartment-name-demo.xlsx'

print("TESTING UPDATED EXCEL FILE")
print("=" * 30)

if os.path.exists(excel_file):
    print(f"✅ Found: {excel_file}")
    
    try:
        excel_data = pd.ExcelFile(excel_file)
        print(f"Sheets: {excel_data.sheet_names}")
        
        total_images = 0
        
        for sheet_name in excel_data.sheet_names:
            df = pd.read_excel(excel_file, sheet_name=sheet_name)
            
            if len(df) > 0:
                print(f"\nSheet: {sheet_name} ({len(df)} products)")
                print(f"Columns: {list(df.columns)}")
                
                # Check Product Image column
                if 'Product Image' in df.columns:
                    image_col = df['Product Image']
                    non_empty = image_col.dropna()
                    
                    if len(non_empty) > 0:
                        # Check for actual content
                        with_content = non_empty[non_empty.astype(str).str.strip() != '']
                        
                        if len(with_content) > 0:
                            print(f"✅ HAS {len(with_content)} IMAGES!")
                            total_images += len(with_content)
                            
                            # Show samples
                            for i, url in enumerate(with_content.head(3), 1):
                                print(f"  {i}. {str(url)[:60]}...")
                        else:
                            print("❌ Product Image column is empty")
                    else:
                        print("❌ Product Image column is null")
                else:
                    print("❌ No Product Image column")
        
        print(f"\nSUMMARY:")
        print(f"Total images found: {total_images}")
        
        if total_images > 0:
            print("🎉 SUCCESS! Ready to import!")
        else:
            print("❌ No images found - add URLs to Product Image column")
            
    except Exception as e:
        print(f"Error: {e}")
else:
    print(f"❌ File not found: {excel_file}")
