#!/bin/bash

echo "============================================================"
echo "🔧 FIXING MIGRATION CONFLICT AND APPLYING CHANGES"
echo "============================================================"

# Step 1: Remove duplicate migration
echo ""
echo "📝 Step 1: Removing duplicate migration..."
cd products/migrations
if [ -f "0002_add_uploaded_file_to_import_session.py" ]; then
    rm 0002_add_uploaded_file_to_import_session.py
    echo "   ✅ Removed duplicate migration"
else
    echo "   ℹ️  No duplicate found (already removed)"
fi
cd ../..

# Step 2: Apply migration
echo ""
echo "📝 Step 2: Applying migration..."
python manage.py migrate products

# Step 3: Show migration status
echo ""
echo "📝 Step 3: Verifying migrations..."
python manage.py showmigrations products

echo ""
echo "============================================================"
echo "✅ DONE! You can now upload files via the API"
echo "============================================================"
echo ""
echo "🎯 Test by uploading a file:"
echo "   The file will be saved to: media/import_files/YYYY/MM/DD/"
echo "   Images will be saved to: media/apartment_products/{apartment_id}/"
echo ""
