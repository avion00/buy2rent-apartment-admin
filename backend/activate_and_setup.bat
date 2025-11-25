@echo off
echo ========================================
echo Buy2Rent Backend Setup with Virtual Env
echo ========================================

REM Check if venv exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo Failed to create virtual environment
        pause
        exit /b 1
    )
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate

REM Check if activation worked
python -c "import sys; print('Virtual env activated:' if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix) else 'Virtual env NOT activated')"

REM Install dependencies
echo.
echo Installing dependencies...
pip install -r requirements.txt

REM Check Django
echo.
echo Checking Django installation...
python -c "import django; print(f'Django {django.get_version()} installed')"

REM Check models
echo.
echo Checking Django models...
python manage.py check

if errorlevel 1 (
    echo Model check failed!
    pause
    exit /b 1
)

REM Create migrations
echo.
echo Creating migrations...
python manage.py makemigrations

REM Apply migrations
echo.
echo Applying migrations...
python manage.py migrate

REM Create superuser
echo.
echo Creating superuser (admin/admin123)...
python manage.py shell -c "from django.contrib.auth.models import User; User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'admin123')"

REM Seed data
echo.
echo Seeding sample data...
python manage.py seed_data

echo.
echo ========================================
echo Setup completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. python manage.py runserver
echo 2. Visit: http://localhost:8000/api/docs/
echo 3. Admin: http://localhost:8000/admin/ (admin/admin123)
echo.
pause
