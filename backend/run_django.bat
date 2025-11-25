@echo off
echo Django Management Commands
echo ========================

echo.
echo Available commands:
echo 1. Check Django configuration
echo 2. Make migrations
echo 3. Run migrations
echo 4. Create superuser
echo 5. Seed sample data
echo 6. Run development server
echo 7. Run shell
echo.

set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" (
    python manage.py check
) else if "%choice%"=="2" (
    python manage.py makemigrations
) else if "%choice%"=="3" (
    python manage.py migrate
) else if "%choice%"=="4" (
    python manage.py createsuperuser
) else if "%choice%"=="5" (
    python manage.py seed_data
) else if "%choice%"=="6" (
    python manage.py runserver
) else if "%choice%"=="7" (
    python manage.py shell
) else (
    echo Invalid choice!
)

pause
