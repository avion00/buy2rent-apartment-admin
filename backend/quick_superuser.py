#!/usr/bin/env python
"""
Quick script to create a superuser with a different username
"""
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Create superuser with different username to avoid conflict
try:
    # Try to create superuser with username 'superadmin'
    user = User.objects.create_superuser(
        username='superadmin',
        email='superadmin@gmail.com',
        password='admin123',  # Change this password!
        first_name='Super',
        last_name='Admin'
    )
    print("✅ Superuser created successfully!")
    print("Username: superadmin")
    print("Email: superadmin@gmail.com")
    print("Password: admin123")
    print("\n🔐 IMPORTANT: Change the password after first login!")
    print("\n🌐 Access Django Admin at: http://localhost:8000/admin/")
    
except Exception as e:
    if "UNIQUE constraint failed" in str(e):
        print("❌ User 'superadmin' already exists")
        print("Trying to make existing user a superuser...")
        try:
            user = User.objects.get(username='superadmin')
            user.is_superuser = True
            user.is_staff = True
            user.is_active = True
            user.save()
            print("✅ Existing 'superadmin' user is now a superuser!")
        except:
            print("❌ Could not update existing user")
    else:
        print(f"❌ Error: {e}")

# Show all users
print("\n=== All Users ===")
for user in User.objects.all():
    print(f"Username: {user.username}, Email: {user.email}, Superuser: {user.is_superuser}")
