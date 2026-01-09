#!/bin/bash

# Buy2Rent Frontend Update Script

set -e

echo "=========================================="
echo "Updating Frontend Only"
echo "=========================================="
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/frontend"

# Pull latest code if using git
if [ -d .git ]; then
    echo "📥 Pulling latest code..."
    git pull origin main || echo "No git repository, continuing..."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build
echo "🔨 Building frontend..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

# Restart
echo "🔄 Restarting frontend service..."
pm2 restart buy2rent-frontend

# Save
pm2 save

echo ""
echo "✅ Frontend updated successfully!"
echo ""
echo "View logs: pm2 logs buy2rent-frontend"
echo ""
