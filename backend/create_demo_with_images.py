#!/usr/bin/env python
"""
Create a demo Excel file with proper image URLs for testing
"""
import pandas as pd

def create_demo_with_images():
    print("🎨 CREATING DEMO EXCEL WITH IMAGES")
    print("=" * 35)
    
    # Sample data with image URLs
    heating_data = [
        {
            'Product Name': 'boiler',
            'Room': 'Bathroom', 
            'Quantity': 1,
            'Cost': '150000 Ft',
            'Description': 'High efficiency boiler',
            'Image': 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Boiler'
        },
        {
            'Product Name': 'heating radiator',
            'Room': 'Bathroom',
            'Quantity': 2, 
            'Cost': '45000 Ft',
            'Description': 'Wall mounted radiator',
            'Image': 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Radiator'
        },
        {
            'Product Name': 'heating panel',
            'Room': 'Living Room',
            'Quantity': 3,
            'Cost': '25000 Ft', 
            'Description': 'Floor heating panel',
            'Image': 'https://via.placeholder.com/300x200/45B7D1/FFFFFF?text=Panel'
        }
    ]
    
    flooring_data = [
        {
            'Product Name': 'EGGER HOME LAMINÁLT PADLÓ LIVINGSTONE TÖLGY',
            'Room': 'Kitchen-livingroom',
            'Quantity': 10,
            'Cost': '8500 Ft',
            'Description': '1292X193X8MM, 1,99 M2/CS, K32',
            'Image': 'https://via.placeholder.com/300x200/96CEB4/FFFFFF?text=Laminate+Floor'
        },
        {
            'Product Name': 'Szegélyléc Modern 60 fehér',
            'Room': 'Kitchen-livingroom', 
            'Quantity': 20,
            'Cost': '1200 Ft',
            'Description': 'White modern trim',
            'Image': 'https://via.placeholder.com/300x200/FECA57/FFFFFF?text=Trim'
        }
    ]
    
    # Create Excel file with multiple sheets
    with pd.ExcelWriter('demo_with_images.xlsx', engine='openpyxl') as writer:
        # Heating sheet
        heating_df = pd.DataFrame(heating_data)
        heating_df.to_excel(writer, sheet_name='Heating', index=False)
        
        # Flooring sheet  
        flooring_df = pd.DataFrame(flooring_data)
        flooring_df.to_excel(writer, sheet_name='Laminated Floors', index=False)
    
    print("✅ Created: demo_with_images.xlsx")
    print("📋 Sheets: Heating, Laminated Floors")
    print("🖼️  Each product has an Image column with placeholder URLs")
    print("\n🚀 Test this file to verify image import works!")
    
    return 'demo_with_images.xlsx'

if __name__ == "__main__":
    create_demo_with_images()
