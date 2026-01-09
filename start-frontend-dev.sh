#!/bin/bash

# Buy2Rent Frontend Development with Live Reload
# Frontend runs locally with instant reload, connects to production backend
# This allows you to develop while keeping the site deployed

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "=========================================="
echo -e "${BLUE}🎨 Buy2Rent Frontend Development${NC}"
echo "=========================================="
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/frontend"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping frontend dev server...${NC}"
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Frontend dev server stopped${NC}"
    exit
}

trap cleanup EXIT INT TERM

# Check if production backend is running
echo -e "${BLUE}🔍 Checking production backend...${NC}"
if curl -s https://procurement.buy2rent.eu/api/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Production backend is running${NC}"
else
    echo -e "${RED}⚠️  Warning: Production backend may not be accessible${NC}"
    echo -e "${YELLOW}   Make sure PM2 backend is running: pm2 status${NC}"
fi
echo ""

# Start Frontend with HMR (Hot Module Replacement)
echo -e "${BLUE}🚀 Starting Frontend Dev Server...${NC}"
echo -e "${GREEN}   ✨ Hot Module Replacement enabled${NC}"
echo -e "${GREEN}   ✨ Changes appear INSTANTLY${NC}"
echo -e "${GREEN}   ✨ Connected to production backend${NC}"
echo ""

# Create logs directory if it doesn't exist
mkdir -p ../logs

# Start Vite dev server
npm run dev 2>&1 | tee ../logs/frontend-dev.log &
FRONTEND_PID=$!

# Wait for frontend to start
echo "   Waiting for frontend to start..."
sleep 5

# Check if frontend started successfully
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Frontend failed to start. Check logs/frontend-dev.log${NC}"
    exit 1
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Frontend Dev Server Running!${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}📱 Local Frontend:${NC}     http://localhost:8080"
echo -e "${BLUE}🌐 Production Site:${NC}    https://procurement.buy2rent.eu"
echo -e "${BLUE}🔧 Backend API:${NC}        https://procurement.buy2rent.eu"
echo -e "${BLUE}📚 API Docs:${NC}           https://procurement.buy2rent.eu/api/docs/"
echo ""
echo "=========================================="
echo -e "${YELLOW}💡 HYBRID DEVELOPMENT MODE${NC}"
echo "=========================================="
echo ""
echo "✨ Frontend: LIVE RELOAD (instant changes)"
echo "🔗 Backend:  PRODUCTION (deployed version)"
echo ""
echo -e "${YELLOW}How it works:${NC}"
echo "1. Edit files in frontend/src/"
echo "2. Save → Changes appear INSTANTLY at localhost:8080"
echo "3. Backend API calls go to production server"
echo "4. Your deployed site stays online!"
echo ""
echo -e "${YELLOW}To update backend:${NC}"
echo "   Edit backend files and run: ./update-backend.sh"
echo ""
echo -e "${RED}Press Ctrl+C to stop dev server${NC}"
echo ""

# Wait for process
wait
