#!/usr/bin/env python
"""
Create a test Excel file with proper web-accessible image URLs
"""
import pandas as pd
import os

def create_test_excel():
    print("🔧 CREATING TEST EXCEL WITH WEB IMAGES")
    print("=" * 50)
    
    # Sample data with proper web-accessible image URLs
    heating_data = {
        'S.N': [1, 2, 3],
        'Room': ['Living Room', 'Bedroom', 'Kitchen'],
        'Product Name': ['Modern Radiator', 'Heating Panel', 'Underfloor Heating'],
        'Product Image': [
            'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Modern+Radiator',
            'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Heating+Panel',
            'https://via.placeholder.com/300x200/45B7D1/FFFFFF?text=Underfloor+Heating'
        ],
        'Quantity': [2, 1, 1],
        'Cost': ['15000 Ft', '25000 Ft', '45000 Ft'],
        'Total Cost': ['30000 Ft', '25000 Ft', '45000 Ft'],
        'Description': [
            'High-efficiency modern radiator with smart controls',
            'Wall-mounted heating panel with timer',
            'Electric underfloor heating system'
        ],
        'link': [
            'https://example.com/radiator',
            'https://example.com/panel',
            'https://example.com/underfloor'
        ]
    }
    
    flooring_data = {
        'S.N': [1, 2],
        'Room': ['Living Room', 'Bedroom'],
        'Product Name': ['Oak Laminate Flooring', 'Vinyl Plank Flooring'],
        'Product Image': [
            'https://via.placeholder.com/300x200/96CEB4/FFFFFF?text=Oak+Laminate',
            'https://via.placeholder.com/300x200/FECA57/FFFFFF?text=Vinyl+Plank'
        ],
        'Quantity': [25, 20],
        'Cost': ['3500 Ft', '2800 Ft'],
        'Total Cost': ['87500 Ft', '56000 Ft'],
        'Description': [
            'Premium oak laminate with AC4 rating',
            'Waterproof vinyl plank flooring'
        ],
        'link': [
            'https://example.com/oak-laminate',
            'https://example.com/vinyl-plank'
        ],
        'size': ['1200x200mm', '1220x180mm'],
        'nm': ['2.4', '2.2'],
        'plusz nm': ['0.2', '0.1'],
        'price/nm': ['1458 Ft', '1273 Ft'],
        'price/package': ['3500 Ft', '2800 Ft'],
        'nm/package': ['2.4', '2.2'],
        'all package': ['25', '20'],
        'package need to order': ['25', '20'],
        'all price': ['87500 Ft', '56000 Ft']
    }
    
    # Create Excel file
    filename = 'test_apartment_with_web_images.xlsx'
    filepath = os.path.join('static', filename)
    
    # Ensure static directory exists
    os.makedirs('static', exist_ok=True)
    
    with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
        # Create heating sheet
        heating_df = pd.DataFrame(heating_data)
        heating_df.to_excel(writer, sheet_name='Heating', index=False)
        
        # Create flooring sheet
        flooring_df = pd.DataFrame(flooring_data)
        flooring_df.to_excel(writer, sheet_name='Laminated floors', index=False)
    
    print(f"✅ Created: {filepath}")
    print(f"📊 Sheets: Heating ({len(heating_data['S.N'])} products), Laminated floors ({len(flooring_data['S.N'])} products)")
    print(f"🖼️  All products have web-accessible image URLs")
    
    # Verify the file
    print("\n🔍 VERIFICATION:")
    excel_data = pd.ExcelFile(filepath)
    total_images = 0
    
    for sheet_name in excel_data.sheet_names:
        df = pd.read_excel(filepath, sheet_name=sheet_name)
        if 'Product Image' in df.columns:
            image_col = df['Product Image']
            web_images = image_col[image_col.str.startswith('https://', na=False)]
            total_images += len(web_images)
            print(f"   Sheet '{sheet_name}': {len(web_images)} web images")
            for i, url in enumerate(web_images.head(2), 1):
                print(f"      {i}. {url}")
    
    print(f"\n🎉 SUCCESS! Created {filename} with {total_images} web-accessible images")
    print(f"\n📋 NEXT STEPS:")
    print(f"   1. Import this file: {filepath}")
    print(f"   2. Check the product list - images should display properly")
    print(f"   3. Open browser console to see any loading issues")

if __name__ == "__main__":
    create_test_excel()
