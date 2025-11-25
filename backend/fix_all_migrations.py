#!/usr/bin/env python3
"""
Comprehensive script to fix all Django migration issues
"""
import os
import sys
import subprocess
import shutil

def run_command(command, cwd=None):
    """Run a command and return success status"""
    try:
        result = subprocess.run(command, shell=True, cwd=cwd, 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {command}")
            if result.stdout.strip():
                print(f"   Output: {result.stdout.strip()}")
            return True
        else:
            print(f"❌ {command}")
            if result.stderr.strip():
                print(f"   Error: {result.stderr.strip()}")
            return False
    except Exception as e:
        print(f"❌ {command} - Exception: {e}")
        return False

def cleanup_pycache():
    """Remove all __pycache__ directories"""
    removed_count = 0
    
    for root, dirs, files in os.walk('.'):
        if '__pycache__' in dirs:
            pycache_path = os.path.join(root, '__pycache__')
            try:
                shutil.rmtree(pycache_path)
                removed_count += 1
            except:
                pass
    
    print(f"🧹 Cleaned up {removed_count} __pycache__ directories")
    return True

def main():
    print("🔧 Comprehensive Django Migration Fix")
    print("=" * 50)
    
    # Step 1: Clean up cache
    print("\n1. Cleaning up Python cache...")
    cleanup_pycache()
    
    # Step 2: Check Django setup
    print("\n2. Testing Django setup...")
    if not run_command("python manage.py check --deploy"):
        print("⚠️  Django check failed, but continuing...")
    
    # Step 3: Make fresh migrations
    print("\n3. Creating fresh migrations...")
    run_command("python manage.py makemigrations")
    
    # Step 4: Show migration status
    print("\n4. Checking migration status...")
    run_command("python manage.py showmigrations")
    
    # Step 5: Apply migrations
    print("\n5. Applying migrations...")
    if run_command("python manage.py migrate"):
        print("✅ All migrations applied successfully!")
    else:
        print("❌ Migration failed. You may need to reset the database.")
        print("\nTo reset database (WARNING: This will delete all data):")
        print("1. Delete db.sqlite3")
        print("2. Run: python manage.py migrate")
    
    print("\n" + "=" * 50)
    print("🎉 Migration fix process completed!")
    print("\nTo start the server:")
    print("python manage.py runserver")

if __name__ == "__main__":
    main()
