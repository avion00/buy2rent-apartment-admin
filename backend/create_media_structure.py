#!/usr/bin/env python
"""
Create media directory structure
"""
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings

def create_media_structure():
    """Create media directory structure"""
    print("📁 CREATING MEDIA DIRECTORY STRUCTURE")
    print("=" * 40)
    
    # Create main media directory
    media_root = settings.MEDIA_ROOT
    print(f"📂 Media root: {media_root}")
    
    if not os.path.exists(media_root):
        os.makedirs(media_root)
        print(f"✅ Created media directory: {media_root}")
    else:
        print(f"✅ Media directory already exists: {media_root}")
    
    # Create products subdirectory
    products_dir = os.path.join(media_root, 'products')
    if not os.path.exists(products_dir):
        os.makedirs(products_dir)
        print(f"✅ Created products directory: {products_dir}")
    else:
        print(f"✅ Products directory already exists: {products_dir}")
    
    # Create a test image to verify serving
    test_image_path = os.path.join(products_dir, 'test.txt')
    with open(test_image_path, 'w') as f:
        f.write("Test file to verify media serving")
    print(f"✅ Created test file: {test_image_path}")
    
    print(f"\n🌐 Media URL configuration:")
    print(f"   • MEDIA_URL: {settings.MEDIA_URL}")
    print(f"   • MEDIA_ROOT: {settings.MEDIA_ROOT}")
    print(f"   • Test file URL: {settings.MEDIA_URL}products/test.txt")
    
    return True

if __name__ == "__main__":
    print("🚀 MEDIA STRUCTURE SETUP\n")
    
    try:
        create_media_structure()
        print(f"\n🎉 Media structure created successfully!")
        print(f"   You can now import Excel files with images")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
    
    print(f"\n✅ Setup complete!")
