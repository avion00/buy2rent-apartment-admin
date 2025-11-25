#!/bin/bash

echo "🔧 Quick Fix: Creating Missing Migrations"
echo "========================================"

# Make sure we're in the right directory
if [ ! -f "manage.py" ]; then
    echo "❌ Please run this from the backend directory"
    exit 1
fi

# Check if virtual environment is activated
python -c "import sys; print('✅ Virtual env activated' if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix) else '❌ Please activate virtual environment first')"

echo ""
echo "📝 Creating migrations for each app..."

# Create migrations for each app
python manage.py makemigrations clients
python manage.py makemigrations apartments
python manage.py makemigrations vendors
python manage.py makemigrations products
python manage.py makemigrations deliveries
python manage.py makemigrations payments
python manage.py makemigrations issues
python manage.py makemigrations activities
python manage.py makemigrations authentication

echo ""
echo "📝 Running general makemigrations..."
python manage.py makemigrations

echo ""
echo "🗄️ Applying all migrations..."
python manage.py migrate

echo ""
echo "🌱 Seeding sample data..."
python manage.py seed_data

echo ""
echo "✅ Setup completed! You can now run:"
echo "   python manage.py runserver"
