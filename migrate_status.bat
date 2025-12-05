@echo off
echo ========================================
echo Converting Product Status to Array
echo ========================================
echo.
echo This will:
echo - Change status field from VARCHAR to JSONB
echo - Convert all existing status values to arrays
echo - Example: "Wrong Item" becomes ["Wrong Item"]
echo.
cd backend
python manage.py migrate products 0011
echo.
echo ========================================
echo Migration Complete!
echo ========================================
echo.
echo Now you have:
echo - ONE status field (array type)
echo - NO status_tags (removed)
echo - NO statusTags (removed)
echo.
pause
