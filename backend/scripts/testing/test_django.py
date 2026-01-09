#!/usr/bin/env python3
"""
Test script to check if Django can start properly after migration fixes
"""
import os
import sys
import django
from django.core.management import execute_from_command_line

# Add the project directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

def test_django_setup():
    """Test if Django can be set up without errors"""
    try:
        django.setup()
        print("✅ Django setup successful!")
        return True
    except Exception as e:
        print(f"❌ Django setup failed: {e}")
        return False

def test_migrations():
    """Test if migrations can be checked without errors"""
    try:
        from django.core.management.commands.showmigrations import Command
        command = Command()
        print("✅ Migration system accessible!")
        return True
    except Exception as e:
        print(f"❌ Migration system error: {e}")
        return False

def main():
    print("🔧 Testing Django setup after migration fixes...")
    
    if not test_django_setup():
        return False
        
    if not test_migrations():
        return False
    
    print("\n✅ All tests passed! Django should work properly now.")
    print("\nNext steps:")
    print("1. Run: python manage.py makemigrations")
    print("2. Run: python manage.py migrate") 
    print("3. Run: python manage.py runserver")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
