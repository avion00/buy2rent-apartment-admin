#!/usr/bin/env python
"""
Complete setup script with virtual environment handling
"""

import os
import sys
import subprocess
import platform

def run_command(command, cwd=None):
    """Run a command and return success status"""
    try:
        result = subprocess.run(command, shell=True, cwd=cwd, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {command}")
            if result.stdout:
                print(result.stdout)
            return True
        else:
            print(f"❌ {command}")
            if result.stderr:
                print(result.stderr)
            return False
    except Exception as e:
        print(f"❌ Error running {command}: {e}")
        return False

def check_venv():
    """Check if virtual environment is activated"""
    if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("✅ Virtual environment is activated")
        return True
    else:
        print("❌ Virtual environment is NOT activated")
        return False

def create_venv_if_needed():
    """Create virtual environment if it doesn't exist"""
    venv_path = "venv"
    if not os.path.exists(venv_path):
        print("Creating virtual environment...")
        if run_command("python -m venv venv"):
            print("✅ Virtual environment created")
        else:
            print("❌ Failed to create virtual environment")
            return False
    else:
        print("✅ Virtual environment already exists")
    return True

def get_activation_command():
    """Get the correct activation command for the platform"""
    if platform.system() == "Windows":
        return "venv\\Scripts\\activate"
    else:
        return "source venv/bin/activate"

def main():
    """Main setup function"""
    print("🚀 Buy2Rent Backend Setup with Virtual Environment")
    print("=" * 60)
    
    # Check current directory
    if not os.path.exists("manage.py"):
        print("❌ Please run this script from the backend directory")
        sys.exit(1)
    
    # Check if venv is activated
    if not check_venv():
        print("\n⚠️  Virtual environment is not activated!")
        print("Please activate it first:")
        print(f"   {get_activation_command()}")
        print("   Then run this script again")
        
        # Try to create venv if it doesn't exist
        if not os.path.exists("venv"):
            print("\n📦 Creating virtual environment for you...")
            create_venv_if_needed()
            print(f"\n🔧 Now activate it with: {get_activation_command()}")
        
        sys.exit(1)
    
    print(f"🐍 Python version: {sys.version}")
    print(f"📁 Working directory: {os.getcwd()}")
    
    # Install/upgrade dependencies
    print("\n📦 Installing dependencies...")
    if not run_command("pip install -r requirements.txt"):
        print("❌ Failed to install dependencies")
        sys.exit(1)
    
    # Check Django installation
    print("\n🔍 Checking Django installation...")
    try:
        import django
        print(f"✅ Django {django.get_version()} installed")
    except ImportError:
        print("❌ Django not installed properly")
        sys.exit(1)
    
    # Set Django settings
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    
    # Check Django models
    print("\n🔍 Checking Django models...")
    if not run_command("python manage.py check"):
        print("❌ Django model check failed")
        sys.exit(1)
    
    # Create migrations
    print("\n📝 Creating database migrations...")
    if not run_command("python manage.py makemigrations"):
        print("❌ Failed to create migrations")
        sys.exit(1)
    
    # Apply migrations
    print("\n🗄️  Applying database migrations...")
    if not run_command("python manage.py migrate"):
        print("❌ Failed to apply migrations")
        sys.exit(1)
    
    # Create superuser
    print("\n👤 Creating superuser...")
    if not run_command('python manage.py shell -c "from django.contrib.auth.models import User; User.objects.filter(username=\'admin\').exists() or User.objects.create_superuser(\'admin\', \'admin@example.com\', \'admin123\')"'):
        print("⚠️  Superuser creation may have failed, but continuing...")
    
    # Seed data
    print("\n🌱 Seeding sample data...")
    if not run_command("python manage.py seed_data"):
        print("⚠️  Data seeding may have failed, but continuing...")
    
    print("\n" + "=" * 60)
    print("🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Start the server: python manage.py runserver")
    print("2. Test APIs: http://localhost:8000/api/docs/")
    print("3. Admin panel: http://localhost:8000/admin/ (admin/admin123)")
    print("\n📚 Documentation URLs:")
    print("- Swagger UI: http://localhost:8000/api/docs/")
    print("- ReDoc: http://localhost:8000/api/redoc/")
    print("- Browsable API: http://localhost:8000/api/")

if __name__ == '__main__':
    main()
