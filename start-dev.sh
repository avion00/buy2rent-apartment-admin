#!/bin/bash

echo "Starting Buy2Rent Development Servers..."
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup EXIT INT TERM

# Start backend
cd backend
python manage.py runserver &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo "Development servers started!"
echo "========================================"
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:8080"
echo "API Docs: http://localhost:8000/api/docs/"
echo "========================================"
echo ""
echo "Both servers will auto-reload on file changes!"
echo "Press Ctrl+C to stop both servers."
echo ""

# Wait for both processes
wait
