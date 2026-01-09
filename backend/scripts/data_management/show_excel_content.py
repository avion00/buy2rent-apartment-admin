#!/usr/bin/env python
"""
Show exact Excel content to identify image columns
"""
import pandas as pd
import os

excel_file = 'sample_products_with_images.xlsx'

if os.path.exists(excel_file):
    print("📊 EXCEL FILE CONTENT:")
    print("=" * 25)
    
    excel_data = pd.ExcelFile(excel_file)
    
    for sheet_name in excel_data.sheet_names:
        df = pd.read_excel(excel_file, sheet_name=sheet_name)
        
        print(f"\n📋 Sheet: {sheet_name}")
        print(f"Columns: {list(df.columns)}")
        
        if len(df) > 0:
            print(f"\nFirst row data:")
            for col in df.columns:
                value = df.iloc[0][col]
                if pd.notna(value):
                    print(f"  {col}: {value}")
else:
    print("❌ Excel file not found")
