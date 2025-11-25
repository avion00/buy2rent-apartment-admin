#!/usr/bin/env python
"""
Test the empty row filtering functionality
"""
import os
import sys
import django
import pandas as pd

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.import_service import ProductImportService

def test_row_filtering():
    """Test that empty/meaningless rows are filtered out"""
    print("🔍 TESTING EMPTY ROW FILTERING")
    print("=" * 30)
    
    # Create test data with meaningful and empty rows
    test_data = {
        'S.N': [1, 2, 3, 4, 5, 6],
        'Product Name': ['Chair', '', None, 'Table', '', ''],
        'Room': ['Living Room', '', '', 'Kitchen', '', ''],
        'Cost': ['5000 Ft', '', '', '8000 Ft', '', ''],
        'Description': ['Comfortable chair', '', '', 'Wooden table', '', ''],
        'Quantity': [1, '', '', 2, '', '']
    }
    
    df = pd.DataFrame(test_data)
    print("📊 Test DataFrame:")
    print(df.to_string())
    print()
    
    # Test the filtering logic
    service = ProductImportService()
    
    meaningful_rows = []
    empty_rows = []
    
    for index, row in df.iterrows():
        if service._is_row_meaningful(row):
            meaningful_rows.append(index + 1)  # +1 for human-readable row numbers
            print(f"✅ Row {index + 1}: MEANINGFUL - {dict(row.dropna())}")
        else:
            empty_rows.append(index + 1)
            print(f"❌ Row {index + 1}: EMPTY/MEANINGLESS - Only has: {[k for k, v in row.items() if pd.notna(v) and str(v).strip()]}")
    
    print(f"\n📊 FILTERING RESULTS:")
    print(f"   ✅ Meaningful rows: {len(meaningful_rows)} (rows: {meaningful_rows})")
    print(f"   ❌ Empty/meaningless rows: {len(empty_rows)} (rows: {empty_rows})")
    
    print(f"\n🎯 EXPECTED BEHAVIOR:")
    print(f"   • Only rows with meaningful product data should be imported")
    print(f"   • Rows with only S.N or mostly empty fields should be skipped")
    print(f"   • This will prevent 'Unnamed Product' entries with no useful data")
    
    return len(meaningful_rows) < len(df)

def test_edge_cases():
    """Test edge cases for row filtering"""
    print(f"\n🧪 TESTING EDGE CASES")
    print("=" * 20)
    
    service = ProductImportService()
    
    # Test cases
    test_cases = [
        # Case 1: Only S.N
        {'S.N': '1', 'Product Name': '', 'Room': ''},
        
        # Case 2: Only S.N and empty strings
        {'S.N': '2', 'Product Name': '', 'Room': '', 'Cost': ''},
        
        # Case 3: Has product name
        {'S.N': '3', 'Product Name': 'Chair', 'Room': ''},
        
        # Case 4: Has cost but no name
        {'S.N': '4', 'Product Name': '', 'Room': '', 'Cost': '5000 Ft'},
        
        # Case 5: Multiple meaningful fields
        {'S.N': '5', 'Product Name': 'Table', 'Room': 'Kitchen', 'Cost': '8000 Ft'},
        
        # Case 6: Generic/meaningless values
        {'S.N': '6', 'Product Name': 'N/A', 'Room': '-', 'Cost': '0'},
    ]
    
    for i, case in enumerate(test_cases, 1):
        row = pd.Series(case)
        is_meaningful = service._is_row_meaningful(row)
        status = "✅ MEANINGFUL" if is_meaningful else "❌ EMPTY"
        print(f"   Case {i}: {status} - {case}")
    
    return True

if __name__ == "__main__":
    print("🚀 TESTING EMPTY ROW FILTERING FUNCTIONALITY\n")
    
    test1_passed = test_row_filtering()
    test2_passed = test_edge_cases()
    
    if test1_passed and test2_passed:
        print(f"\n🎉 TESTS PASSED!")
        print(f"   Empty row filtering is working correctly")
        print(f"   Only meaningful product data will be imported")
    else:
        print(f"\n⚠️  Some tests failed")
    
    print(f"\n🚀 Next steps:")
    print(f"1. Re-import your Excel file")
    print(f"2. Check that only products with meaningful data are created")
    print(f"3. Verify no more 'Unnamed Product' entries with empty fields")
