#!/usr/bin/env python
"""
Script to examine the demo Excel file structure
"""
import pandas as pd
import os

def examine_excel_file(file_path):
    """Examine Excel file structure"""
    print("=== Excel File Analysis ===")
    print(f"File: {file_path}")
    
    try:
        # Read Excel file and get all sheet names
        excel_file = pd.ExcelFile(file_path)
        print(f"\nNumber of sheets: {len(excel_file.sheet_names)}")
        print(f"Sheet names: {excel_file.sheet_names}")
        
        # Examine each sheet
        for sheet_name in excel_file.sheet_names:
            print(f"\n{'='*50}")
            print(f"SHEET: {sheet_name}")
            print(f"{'='*50}")
            
            # Read the sheet
            df = pd.read_excel(file_path, sheet_name=sheet_name)
            
            print(f"Rows: {len(df)}")
            print(f"Columns: {len(df.columns)}")
            print(f"Column names: {list(df.columns)}")
            
            # Show first few rows
            print(f"\nFirst 5 rows:")
            print(df.head().to_string())
            
            # Show data types
            print(f"\nData types:")
            for col in df.columns:
                print(f"  {col}: {df[col].dtype}")
            
            # Check for missing values
            print(f"\nMissing values:")
            missing = df.isnull().sum()
            for col in missing.index:
                if missing[col] > 0:
                    print(f"  {col}: {missing[col]} missing")
            
            # Show unique values for categorical columns
            print(f"\nSample values:")
            for col in df.columns:
                unique_count = df[col].nunique()
                if unique_count < 20:  # Show unique values for categorical columns
                    print(f"  {col} ({unique_count} unique): {list(df[col].unique())[:10]}")
                else:
                    print(f"  {col}: {unique_count} unique values")
        
    except Exception as e:
        print(f"Error reading Excel file: {e}")

if __name__ == "__main__":
    file_path = "static/apartment-name-demo.xlsx"
    if os.path.exists(file_path):
        examine_excel_file(file_path)
    else:
        print(f"File not found: {file_path}")
        print("Available files in static directory:")
        if os.path.exists("static"):
            for file in os.listdir("static"):
                print(f"  - {file}")
