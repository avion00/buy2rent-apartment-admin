#!/usr/bin/env python
"""
Test that all ProductViewSet actions have the correct Swagger tags
"""
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.views import ProductViewSet
import inspect

def test_swagger_tags():
    """Test that all ProductViewSet actions have Products tags"""
    print("🔍 TESTING SWAGGER TAGS")
    print("=" * 25)
    
    # Get all action methods
    actions = []
    for attr_name in dir(ProductViewSet):
        attr = getattr(ProductViewSet, attr_name)
        if hasattr(attr, 'mapping') or (hasattr(attr, 'detail') and callable(attr)):
            actions.append((attr_name, attr))
    
    print(f"📊 Found {len(actions)} action methods:")
    
    tagged_actions = []
    untagged_actions = []
    
    for action_name, action_method in actions:
        # Check if the method has extend_schema decorator with tags
        has_products_tag = False
        
        if hasattr(action_method, 'kwargs'):
            # Check for extend_schema decorator
            if 'tags' in str(action_method.kwargs):
                if 'Products' in str(action_method.kwargs):
                    has_products_tag = True
        
        # Also check the actual decorator
        if hasattr(action_method, '_spectacular_annotation'):
            annotation = action_method._spectacular_annotation
            if hasattr(annotation, 'get') and annotation.get('tags'):
                if 'Products' in annotation.get('tags', []):
                    has_products_tag = True
        
        if has_products_tag:
            tagged_actions.append(action_name)
            print(f"   ✅ {action_name} - has Products tag")
        else:
            untagged_actions.append(action_name)
            print(f"   ❌ {action_name} - missing Products tag")
    
    print(f"\n📊 Summary:")
    print(f"   ✅ Tagged actions: {len(tagged_actions)}")
    print(f"   ❌ Untagged actions: {len(untagged_actions)}")
    
    if untagged_actions:
        print(f"\n⚠️  Untagged actions that may cause separate API sections:")
        for action in untagged_actions:
            print(f"      • {action}")
    
    # Check the main ViewSet decorator
    print(f"\n🏷️  ViewSet Tags:")
    if hasattr(ProductViewSet, '_spectacular_annotation'):
        print(f"   ViewSet has spectacular annotation")
    else:
        print(f"   ViewSet uses @add_viewset_tags decorator")
    
    return len(untagged_actions) == 0

if __name__ == "__main__":
    success = test_swagger_tags()
    
    if success:
        print(f"\n🎉 ALL ACTIONS PROPERLY TAGGED!")
        print(f"   All endpoints should appear under single 'Products' section")
    else:
        print(f"\n⚠️  Some actions missing tags")
        print(f"   May cause duplicate API sections in Swagger UI")
    
    print(f"\n🚀 Next steps:")
    print(f"1. Restart Django server")
    print(f"2. Clear browser cache")
    print(f"3. Check /api/docs/ for unified Products section")
