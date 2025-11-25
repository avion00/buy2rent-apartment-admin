#!/usr/bin/env python
"""
Script to manage superuser creation and check existing users
Run this script to resolve superuser creation issues
"""
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User
from django.contrib.auth import get_user_model

User = get_user_model()

def check_existing_users():
    """Check all existing users"""
    print("=== Existing Users ===")
    users = User.objects.all()
    if users:
        for user in users:
            print(f"Username: {user.username}")
            print(f"Email: {user.email}")
            print(f"Is Superuser: {user.is_superuser}")
            print(f"Is Staff: {user.is_staff}")
            print(f"Is Active: {user.is_active}")
            print("-" * 30)
    else:
        print("No users found in database")
    
    print(f"Total users: {users.count()}")
    return users

def make_user_superuser(username):
    """Make an existing user a superuser"""
    try:
        user = User.objects.get(username=username)
        user.is_superuser = True
        user.is_staff = True
        user.is_active = True
        user.save()
        print(f"✅ User '{username}' is now a superuser!")
        return True
    except User.DoesNotExist:
        print(f"❌ User '{username}' does not exist")
        return False

def delete_user(username):
    """Delete an existing user"""
    try:
        user = User.objects.get(username=username)
        user.delete()
        print(f"✅ User '{username}' has been deleted")
        return True
    except User.DoesNotExist:
        print(f"❌ User '{username}' does not exist")
        return False

def create_superuser(username, email, password, first_name="", last_name=""):
    """Create a new superuser"""
    try:
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        print(f"✅ Superuser '{username}' created successfully!")
        return True
    except Exception as e:
        print(f"❌ Error creating superuser: {e}")
        return False

def main():
    print("Django Superuser Management Tool")
    print("=" * 40)
    
    # Check existing users
    users = check_existing_users()
    
    print("\nOptions:")
    print("1. Make existing 'admin' user a superuser")
    print("2. Delete existing 'admin' user and create new superuser")
    print("3. Create superuser with different username")
    print("4. Just check users (no changes)")
    
    choice = input("\nEnter your choice (1-4): ").strip()
    
    if choice == "1":
        # Make existing admin user a superuser
        success = make_user_superuser("admin")
        if success:
            print("\n✅ You can now login to Django admin with:")
            print("Username: admin")
            print("Password: [your existing password]")
    
    elif choice == "2":
        # Delete and recreate
        confirm = input("Are you sure you want to delete the existing 'admin' user? (yes/no): ")
        if confirm.lower() == 'yes':
            delete_user("admin")
            password = input("Enter password for new superuser: ")
            create_superuser("admin", "admin@gmail.com", password, "Admin", "User")
    
    elif choice == "3":
        # Create with different username
        username = input("Enter new username: ")
        email = input("Enter email: ")
        password = input("Enter password: ")
        first_name = input("Enter first name (optional): ")
        last_name = input("Enter last name (optional): ")
        create_superuser(username, email, password, first_name, last_name)
    
    elif choice == "4":
        print("No changes made.")
    
    else:
        print("Invalid choice.")
    
    print("\n" + "=" * 40)
    print("Final user list:")
    check_existing_users()

if __name__ == "__main__":
    main()
