#!/bin/bash

# Buy2Rent Deployment Update Script
# This script updates both frontend and backend

set -e  # Exit on error

echo "=========================================="
echo "Buy2Rent Deployment Update"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${BLUE}📦 Starting deployment update...${NC}"
echo ""

# Update Frontend
echo -e "${BLUE}🎨 Updating Frontend...${NC}"
cd frontend

# Pull latest code if using git
if [ -d .git ]; then
    echo "Pulling latest frontend code..."
    git pull origin main || echo "No git repository or pull failed, continuing..."
fi

# Install dependencies
echo "Installing frontend dependencies..."
npm install

# Build production bundle
echo "Building frontend..."
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Frontend build failed - dist directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend built successfully${NC}"
echo ""

# Update Backend
echo -e "${BLUE}🔧 Updating Backend...${NC}"
cd ../backend

# Pull latest code if using git
if [ -d .git ]; then
    echo "Pulling latest backend code..."
    git pull origin main || echo "No git repository or pull failed, continuing..."
fi

# Activate virtual environment
if [ ! -d "myenv" ]; then
    echo -e "${RED}❌ Virtual environment not found${NC}"
    exit 1
fi

source myenv/bin/activate

# Install dependencies
echo "Installing backend dependencies..."
pip install -r requirements.txt

# Run migrations
echo "Running database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

echo -e "${GREEN}✅ Backend updated successfully${NC}"
echo ""

# Restart services
echo -e "${BLUE}🔄 Restarting services...${NC}"
cd ..

# Restart PM2 processes
PM2_RESTART_ARGS=""
if [ "${UPDATE_ENV}" = "1" ]; then
    PM2_RESTART_ARGS="--update-env"
    echo "Using PM2 --update-env"
fi

pm2 restart buy2rent-frontend ${PM2_RESTART_ARGS}
pm2 restart buy2rent-backend ${PM2_RESTART_ARGS}
pm2 restart email-monitor ${PM2_RESTART_ARGS}

# Save PM2 configuration
pm2 save

echo ""
echo -e "${GREEN}✅ Services restarted${NC}"
echo ""

# Show status
echo -e "${BLUE}📊 Current Status:${NC}"
pm2 status

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Deployment Update Complete!${NC}"
echo "=========================================="
echo ""
echo "Your application is now updated at:"
echo "  https://procurement.buy2rent.eu"
echo ""
echo "To view logs:"
echo "  pm2 logs"
echo ""
echo "To check status:"
echo "  pm2 status"
echo ""
