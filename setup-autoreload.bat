@echo off
echo Installing auto-reload dependencies...
echo.

echo Installing backend dependencies...
cd backend
pip install watchdog[watchmedo]
cd ..

echo.
echo ========================================
echo Setup complete!
echo ========================================
echo.
echo Auto-reload is now enabled for:
echo - Frontend: Vite HMR (already built-in)
echo - Backend: Django auto-reloader + watchdog
echo.
echo To start development servers:
echo   Double-click: start-dev.bat
echo.
echo Or manually:
echo   Terminal 1: cd backend ^&^& python manage.py runserver
echo   Terminal 2: cd frontend ^&^& npm run dev
echo.
pause
