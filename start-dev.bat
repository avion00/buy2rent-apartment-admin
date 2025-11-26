@echo off
echo Starting Buy2Rent Development Servers...
echo.

REM Start backend in a new window
start "Django Backend" cmd /k "cd backend && python manage.py runserver"

REM Wait a moment for backend to start
timeout /t 2 /nobreak > nul

REM Start frontend in a new window
start "Vite Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Development servers starting...
echo ========================================
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:8080
echo API Docs: http://localhost:8000/api/docs/
echo ========================================
echo.
echo Both servers will auto-reload on file changes!
echo Close this window to stop both servers.
echo.
pause
