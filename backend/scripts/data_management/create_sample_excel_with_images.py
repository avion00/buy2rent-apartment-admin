#!/usr/bin/env python
"""
Create a sample Excel file with image URLs for testing
"""
import pandas as pd
import os

def create_sample_excel():
    """Create sample Excel file with image URLs"""
    print("📊 CREATING SAMPLE EXCEL WITH IMAGES")
    print("=" * 40)
    
    # Sample data with image URLs
    sample_data = [
        {
            'S.N': 1,
            'Room': 'Living Room',
            'Product Name': 'Modern Sofa',
            'Product Image': 'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Modern+Sofa',
            'Description': 'Comfortable 3-seater modern sofa',
            'SKU': 'SOF-001',
            'Quantity': 1,
            'Cost': '150000 Ft',
            'Total Cost': '150000 Ft',
            'Link': 'https://example.com/sofa',
            'Size': '200x90x80 cm',
            'Brand': 'IKEA',
            'Color': 'Gray',
            'Material': 'Fabric'
        },
        {
            'S.N': 2,
            'Room': 'Bedroom',
            'Product Name': 'Queen Bed Frame',
            'Image': 'https://via.placeholder.com/400x300/4ECDC4/FFFFFF?text=Queen+Bed',
            'Description': 'Wooden queen size bed frame',
            'SKU': 'BED-002',
            'Quantity': 1,
            'Cost': '80000 Ft',
            'Total Cost': '80000 Ft',
            'Link': 'https://example.com/bed',
            'Size': '160x200x40 cm',
            'Brand': 'Custom',
            'Color': 'Natural Wood',
            'Material': 'Oak Wood'
        },
        {
            'S.N': 3,
            'Room': 'Kitchen',
            'Product Name': 'Dining Table',
            'Photo': 'https://via.placeholder.com/400x300/45B7D1/FFFFFF?text=Dining+Table',
            'Description': 'Round dining table for 4 people',
            'SKU': 'TAB-003',
            'Quantity': 1,
            'Cost': '60000 Ft',
            'Total Cost': '60000 Ft',
            'Link': 'https://example.com/table',
            'Size': '120x120x75 cm',
            'Brand': 'HomeDesign',
            'Color': 'White',
            'Material': 'MDF'
        },
        {
            'S.N': 4,
            'Room': 'Living Room',
            'Product Name': 'Coffee Table',
            'Picture': 'https://via.placeholder.com/400x300/96CEB4/FFFFFF?text=Coffee+Table',
            'Description': 'Glass top coffee table',
            'SKU': 'COF-004',
            'Quantity': 1,
            'Cost': '25000 Ft',
            'Total Cost': '25000 Ft',
            'Link': 'https://example.com/coffee-table',
            'Size': '100x60x45 cm',
            'Brand': 'ModernHome',
            'Color': 'Clear Glass',
            'Material': 'Glass & Metal'
        },
        {
            'S.N': 5,
            'Room': 'Bedroom',
            'Product Name': 'Wardrobe',
            'Image URL': 'https://via.placeholder.com/400x300/FFEAA7/333333?text=Wardrobe',
            'Description': '3-door wardrobe with mirror',
            'SKU': 'WAR-005',
            'Quantity': 1,
            'Cost': '120000 Ft',
            'Total Cost': '120000 Ft',
            'Link': 'https://example.com/wardrobe',
            'Size': '150x60x200 cm',
            'Brand': 'StoragePlus',
            'Color': 'White',
            'Material': 'Laminated Wood'
        }
    ]
    
    # Create DataFrame
    df = pd.DataFrame(sample_data)
    
    # Create the Excel file
    filename = 'sample_products_with_images.xlsx'
    filepath = os.path.join(os.path.dirname(__file__), filename)
    
    with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='Living Room', index=False)
        
        # Create another sheet with different image column names
        bedroom_data = [
            {
                'S.N': 1,
                'Room': 'Bedroom',
                'Product Name': 'Nightstand',
                'Photo URL': 'https://via.placeholder.com/400x300/DDA0DD/FFFFFF?text=Nightstand',
                'Description': 'Wooden nightstand with drawer',
                'SKU': 'NIG-001',
                'Quantity': 2,
                'Cost': '15000 Ft',
                'Total Cost': '30000 Ft',
                'Size': '40x30x50 cm',
                'Brand': 'BedroomPlus',
                'Color': 'Dark Brown',
                'Material': 'Solid Wood'
            },
            {
                'S.N': 2,
                'Room': 'Bedroom',
                'Product Name': 'Dresser',
                'Picture URL': 'https://via.placeholder.com/400x300/F0E68C/333333?text=Dresser',
                'Description': '6-drawer dresser with mirror',
                'SKU': 'DRE-002',
                'Quantity': 1,
                'Cost': '75000 Ft',
                'Total Cost': '75000 Ft',
                'Size': '120x45x80 cm',
                'Brand': 'BedroomPlus',
                'Color': 'White',
                'Material': 'MDF'
            }
        ]
        
        bedroom_df = pd.DataFrame(bedroom_data)
        bedroom_df.to_excel(writer, sheet_name='Bedroom', index=False)
    
    print(f"✅ Sample Excel file created: {filename}")
    print(f"   📁 Location: {filepath}")
    print(f"   📊 Sheets: Living Room, Bedroom")
    print(f"   🖼️  Image columns tested:")
    print(f"      • Product Image")
    print(f"      • Image")
    print(f"      • Photo") 
    print(f"      • Picture")
    print(f"      • Image URL")
    print(f"      • Photo URL")
    print(f"      • Picture URL")
    
    print(f"\n🎯 HOW TO TEST:")
    print(f"   1. Use the frontend import dialog")
    print(f"   2. Upload this Excel file: {filename}")
    print(f"   3. Images will be automatically downloaded and stored")
    print(f"   4. Check the product detail pages to see images")
    
    print(f"\n📋 SAMPLE DATA INCLUDES:")
    print(f"   • 5 products in Living Room sheet")
    print(f"   • 2 products in Bedroom sheet") 
    print(f"   • Different image column names for testing")
    print(f"   • Placeholder images from via.placeholder.com")
    
    return filepath

if __name__ == "__main__":
    print("🚀 SAMPLE EXCEL CREATOR\n")
    
    try:
        filepath = create_sample_excel()
        print(f"\n🎉 SUCCESS!")
        print(f"   Sample Excel file ready for testing image import")
        print(f"   File: {os.path.basename(filepath)}")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
    
    print(f"\n✅ Complete!")
