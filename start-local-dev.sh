#!/bin/bash

# Buy2Rent Local Development Server
# This script starts both frontend and backend with live reload
# Changes will be reflected INSTANTLY without rebuilding

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "=========================================="
echo -e "${BLUE}🚀 Buy2Rent Local Development${NC}"
echo "=========================================="
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping development servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit
}

trap cleanup EXIT INT TERM

# Check if production servers are running
if pm2 list | grep -q "buy2rent"; then
    echo -e "${YELLOW}⚠️  Production servers are running in PM2${NC}"
    echo -e "${YELLOW}   This is OK - local dev will run on different ports${NC}"
    echo ""
fi

# Start Backend with auto-reload
echo -e "${BLUE}🔧 Starting Backend (Django)...${NC}"
cd backend

# Activate virtual environment
if [ ! -d "myenv" ]; then
    echo -e "${RED}❌ Virtual environment not found${NC}"
    echo "Please run: python -m venv myenv"
    exit 1
fi

source myenv/bin/activate

# Start Django development server (auto-reloads on code changes)
echo -e "${GREEN}   Backend will auto-reload on Python file changes${NC}"
python manage.py runserver 0.0.0.0:8000 > ../logs/backend-dev.log 2>&1 &
BACKEND_PID=$!

cd ..

# Wait for backend to start
echo "   Waiting for backend to start..."
sleep 3

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Backend failed to start. Check logs/backend-dev.log${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend started on http://localhost:8000${NC}"
echo ""

# Start Frontend with HMR (Hot Module Replacement)
echo -e "${BLUE}🎨 Starting Frontend (Vite + React)...${NC}"
cd frontend

# Start Vite dev server (instant hot reload)
echo -e "${GREEN}   Frontend will hot-reload instantly on file changes${NC}"
npm run dev > ../logs/frontend-dev.log 2>&1 &
FRONTEND_PID=$!

cd ..

# Wait for frontend to start
echo "   Waiting for frontend to start..."
sleep 3

# Check if frontend started successfully
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Frontend failed to start. Check logs/frontend-dev.log${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo -e "${GREEN}✅ Frontend started on http://localhost:8080${NC}"
echo ""

# Success message
echo "=========================================="
echo -e "${GREEN}✅ Development Servers Running!${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}📱 Frontend:${NC}  http://localhost:8080"
echo -e "${BLUE}🔧 Backend:${NC}   http://localhost:8000"
echo -e "${BLUE}📚 API Docs:${NC}  http://localhost:8000/api/docs/"
echo -e "${BLUE}🔐 Admin:${NC}     http://localhost:8000/admin/"
echo ""
echo "=========================================="
echo -e "${YELLOW}💡 LIVE RELOAD ENABLED${NC}"
echo "=========================================="
echo ""
echo "✨ Frontend: Changes appear INSTANTLY (HMR)"
echo "✨ Backend:  Auto-reloads on Python file save"
echo ""
echo -e "${YELLOW}📝 View Logs:${NC}"
echo "   Backend:  tail -f logs/backend-dev.log"
echo "   Frontend: tail -f logs/frontend-dev.log"
echo ""
echo -e "${RED}Press Ctrl+C to stop both servers${NC}"
echo ""

# Wait for both processes
wait
