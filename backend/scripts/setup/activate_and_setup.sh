#!/bin/bash

echo "========================================"
echo "Buy2Rent Backend Setup with Virtual Env"
echo "========================================"

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "Failed to create virtual environment"
        exit 1
    fi
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Check if activation worked
python -c "import sys; print('✅ Virtual env activated' if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix) else '❌ Virtual env NOT activated')"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Check Django
echo ""
echo "🔍 Checking Django installation..."
python -c "import django; print(f'✅ Django {django.get_version()} installed')"

# Check models
echo ""
echo "🔍 Checking Django models..."
python manage.py check

if [ $? -ne 0 ]; then
    echo "❌ Model check failed!"
    exit 1
fi

# Create migrations
echo ""
echo "📝 Creating migrations..."
python manage.py makemigrations

# Apply migrations
echo ""
echo "🗄️ Applying migrations..."
python manage.py migrate

# Create superuser
echo ""
echo "👤 Creating superuser (admin/admin123)..."
python manage.py shell -c "from django.contrib.auth.models import User; User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'admin123')"

# Seed data
echo ""
echo "🌱 Seeding sample data..."
python manage.py seed_data

echo ""
echo "========================================"
echo "🎉 Setup completed successfully!"
echo "========================================"
echo ""
echo "📋 Next steps:"
echo "1. python manage.py runserver"
echo "2. Visit: http://localhost:8000/api/docs/"
echo "3. Admin: http://localhost:8000/admin/ (admin/admin123)"
echo ""
echo "📚 Documentation URLs:"
echo "- Swagger UI: http://localhost:8000/api/docs/"
echo "- ReDoc: http://localhost:8000/api/redoc/"
echo "- Browsable API: http://localhost:8000/api/"
