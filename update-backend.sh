#!/bin/bash

# Buy2Rent Backend Update Script

set -e

echo "=========================================="
echo "Updating Backend Only"
echo "=========================================="
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/backend"

# Pull latest code if using git
if [ -d .git ]; then
    echo "📥 Pulling latest code..."
    git pull origin main || echo "No git repository, continuing..."
fi

# Activate virtual environment
if [ ! -d "myenv" ]; then
    echo "❌ Virtual environment not found"
    exit 1
fi

source myenv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Run migrations
echo "🗄️  Running migrations..."
python manage.py migrate --noinput

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

# Restart
echo "🔄 Restarting backend service..."
cd ..
pm2 restart buy2rent-backend

# Save
pm2 save

echo ""
echo "✅ Backend updated successfully!"
echo ""
echo "View logs: pm2 logs buy2rent-backend"
echo ""
