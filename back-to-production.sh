#!/bin/bash

# Back to Production Script
# This script stops development servers and restarts production

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "=========================================="
echo -e "${BLUE}🔄 Switching to Production Mode${NC}"
echo "=========================================="
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Stop development servers
echo -e "${YELLOW}🛑 Stopping development servers...${NC}"
pm2 stop buy2rent-backend-dev buy2rent-frontend-dev 2>/dev/null || echo "Dev servers not running"
pm2 delete buy2rent-backend-dev buy2rent-frontend-dev 2>/dev/null || echo "Dev servers already deleted"
echo ""

# Start production servers
echo -e "${BLUE}🚀 Starting production servers...${NC}"
pm2 start ecosystem.config.js

echo ""
echo -e "${GREEN}✅ Production servers started!${NC}"
echo ""

# Save PM2 configuration
pm2 save

# Show status
echo -e "${BLUE}📊 Current Status:${NC}"
pm2 status

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Production Mode Active!${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}🌐 Access your application:${NC}"
echo "  https://procurement.buy2rent.eu"
echo ""
echo -e "${YELLOW}📝 View logs:${NC}"
echo "  pm2 logs buy2rent-backend"
echo "  pm2 logs buy2rent-frontend"
echo ""
