#!/bin/bash

echo "============================================================"
echo "🔧 FIXING MIGRATION ISSUES - FINAL FIX"
echo "============================================================"

cd products/migrations

echo ""
echo "📝 Step 1: Removing problematic migration files..."

# Remove the empty/corrupted 0002 file
if [ -f "0002_add_uploaded_file_to_import_session.py" ]; then
    echo "   🗑️  Removing: 0002_add_uploaded_file_to_import_session.py"
    rm 0002_add_uploaded_file_to_import_session.py
    echo "   ✅ Removed"
else
    echo "   ℹ️  File not found (already removed)"
fi

# Remove the merge migration if it exists
if [ -f "0011_merge_20251201_0729.py" ]; then
    echo "   🗑️  Removing: 0011_merge_20251201_0729.py"
    rm 0011_merge_20251201_0729.py
    echo "   ✅ Removed"
else
    echo "   ℹ️  Merge file not found (already removed)"
fi

cd ../..

echo ""
echo "📝 Step 2: Verifying migration chain..."
python manage.py showmigrations products

echo ""
echo "📝 Step 3: Applying migrations..."
python manage.py migrate products

echo ""
echo "============================================================"
echo "✅ MIGRATIONS FIXED!"
echo "============================================================"
echo ""
echo "🚀 Now you can run:"
echo "   python manage.py runserver"
echo ""
