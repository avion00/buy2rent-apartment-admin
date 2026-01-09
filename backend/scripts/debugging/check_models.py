#!/usr/bin/env python
"""
Quick model check script
"""

import os
import sys
import django
from django.core.management import execute_from_command_line

def main():
    """Check Django models"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    django.setup()
    
    print("Checking Django models...")
    try:
        execute_from_command_line(['manage.py', 'check'])
        print("✅ Models check passed!")
    except Exception as e:
        print(f"❌ Models check failed: {e}")
        return False
    
    return True

if __name__ == '__main__':
    success = main()
    if success:
        print("\n🎉 Ready to run migrations!")
        print("Next steps:")
        print("1. python manage.py makemigrations")
        print("2. python manage.py migrate")
    else:
        sys.exit(1)
