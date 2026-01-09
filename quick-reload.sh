#!/bin/bash

# Quick Reload Script - Switch to Development Mode with Hot Reload
# This script stops production and starts development servers with instant reload

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "=========================================="
echo -e "${BLUE}🔄 Quick Reload - Development Mode${NC}"
echo "=========================================="
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Stop production servers
echo -e "${YELLOW}🛑 Stopping production servers...${NC}"
pm2 stop buy2rent-backend buy2rent-frontend 2>/dev/null || echo "Production servers not running"
echo ""

# Start development servers with hot reload
echo -e "${BLUE}🚀 Starting development servers with HOT RELOAD...${NC}"
pm2 start ecosystem.dev.config.js

echo ""
echo -e "${GREEN}✅ Development servers started!${NC}"
echo ""

# Save PM2 configuration
pm2 save

# Show status
echo -e "${BLUE}📊 Current Status:${NC}"
pm2 status

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Hot Reload Mode Active!${NC}"
echo "=========================================="
echo ""
echo -e "${YELLOW}💡 Changes will auto-reload:${NC}"
echo "  ✨ Frontend: Instant HMR (Hot Module Replacement)"
echo "  ✨ Backend:  Auto-restart on Python file changes"
echo ""
echo -e "${BLUE}🌐 Access your application:${NC}"
echo "  Frontend: https://procurement.buy2rent.eu"
echo "  Backend:  https://procurement.buy2rent.eu/api/"
echo ""
echo -e "${YELLOW}📝 View logs:${NC}"
echo "  pm2 logs buy2rent-backend-dev"
echo "  pm2 logs buy2rent-frontend-dev"
echo ""
echo -e "${YELLOW}🔄 To switch back to production:${NC}"
echo "  bash back-to-production.sh"
echo ""
