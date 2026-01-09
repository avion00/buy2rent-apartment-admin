import pandas as pd
import os

# Check the demo Excel file
excel_file = 'static/apartment-name-demo.xlsx'

if os.path.exists(excel_file):
    print("DEMO EXCEL FILE ANALYSIS:")
    print("=" * 30)
    
    try:
        # Read Excel file
        excel_data = pd.ExcelFile(excel_file)
        print(f"Sheets: {excel_data.sheet_names}")
        
        for sheet_name in excel_data.sheet_names:
            df = pd.read_excel(excel_file, sheet_name=sheet_name)
            print(f"\nSheet: {sheet_name}")
            print(f"Columns: {list(df.columns)}")
            print(f"Rows: {len(df)}")
            
            # Check first row
            if len(df) > 0:
                print("First row data:")
                for col in df.columns:
                    value = df.iloc[0][col]
                    if pd.notna(value):
                        print(f"  {col}: {value}")
            
            # Look for image-related columns
            image_cols = []
            for col in df.columns:
                if any(word in str(col).lower() for word in ['image', 'photo', 'picture', 'url']):
                    image_cols.append(col)
            
            if image_cols:
                print(f"Image columns found: {image_cols}")
            else:
                print("NO IMAGE COLUMNS FOUND!")
                
    except Exception as e:
        print(f"Error: {e}")
else:
    print(f"File not found: {excel_file}")
