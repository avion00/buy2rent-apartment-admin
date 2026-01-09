#!/bin/bash

# Quick Update Script - Restart servers without full rebuild
# Use this when you've made changes and want to restart quickly

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "=========================================="
echo -e "${BLUE}⚡ Quick Update (No Rebuild)${NC}"
echo "=========================================="
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check which mode is running
if pm2 list | grep -q "buy2rent-backend-dev"; then
    MODE="development"
    BACKEND_NAME="buy2rent-backend-dev"
    FRONTEND_NAME="buy2rent-frontend-dev"
    echo -e "${BLUE}Running in: DEVELOPMENT MODE${NC}"
else
    MODE="production"
    BACKEND_NAME="buy2rent-backend"
    FRONTEND_NAME="buy2rent-frontend"
    echo -e "${BLUE}Running in: PRODUCTION MODE${NC}"
fi

echo ""

# Quick restart
echo -e "${YELLOW}🔄 Restarting servers...${NC}"
pm2 restart $BACKEND_NAME $FRONTEND_NAME

echo ""
echo -e "${GREEN}✅ Servers restarted!${NC}"
echo ""

# Show status
echo -e "${BLUE}📊 Current Status:${NC}"
pm2 status

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Quick Update Complete!${NC}"
echo "=========================================="
echo ""
echo -e "${YELLOW}💡 Tip:${NC} Changes are now live!"
echo ""
