# Migration Fix Steps

## Issue
Migration conflict detected due to duplicate `0002_` migration files.

## Solution

### Step 1: Remove the incorrect migration file

```bash
cd backend/products/migrations
rm 0002_add_uploaded_file_to_import_session.py
```

### Step 2: Apply the correct migration

```bash
cd backend
python manage.py migrate products
```

The correct migration file `0010_importsession_uploaded_file.py` has been created with proper dependencies.

### Step 3: Verify migration

```bash
python manage.py showmigrations products
```

You should see:
```
products
 [X] 0001_initial
 [X] 0002_alter_product_id
 [X] 0003_alter_product_image_url_alter_product_replacement_of
 [X] 0004_product_color_product_description_product_dimensions_and_more
 [X] 0005_product_all_package_product_all_price_product_cost_and_more
 [X] 0006_alter_product_image_url
 [X] 0007_add_delivery_fields
 [X] 0008_remove_product_delivery_status_tags_and_more
 [X] 0009_product_delivery_status_tags
 [X] 0010_importsession_uploaded_file
```

### Step 4: Test the import

Upload a file via the API and check if it's saved:

```bash
# Check saved files
ls -la media/import_files/

# Check extracted images
ls -la media/apartment_products/
```

## About the "Import Failed" Error

Looking at your screenshot, the import is failing. This could be due to:

1. **Migration not applied** - The `uploaded_file` field doesn't exist yet
2. **Image extraction issue** - Images not being found/extracted
3. **Data validation issue** - Some required fields missing

### To Debug:

1. **Check Django logs:**
   ```bash
   # In your terminal where Django is running
   # Look for error messages
   ```

2. **Check the ImportSession error_log:**
   ```bash
   python manage.py shell
   >>> from products.models import ImportSession
   >>> session = ImportSession.objects.last()
   >>> print(session.error_log)
   >>> print(session.status)
   ```

3. **Test with detailed logging:**
   The import service now has detailed logging. Check your console for:
   - `"Found X images in sheet 'SheetName'"`
   - `"Processing image 1 at row X"`
   - `"✅ Extracted image for row X"`
   - `"⚠️ No image found for product"`

### Quick Test Command:

```bash
cd backend
python manage.py shell

# Test import
from products.import_service import ProductImportService
from apartments.models import Apartment
from django.core.files.uploadedfile import SimpleUploadedFile

# Get apartment
apt = Apartment.objects.first()

# Open and upload file
with open('path/to/your/apartment-name-demo.xlsx', 'rb') as f:
    file = SimpleUploadedFile('test.xlsx', f.read())
    service = ProductImportService()
    result = service.process_import(file, apt.id)
    print(result)
```

This will show you the exact error.
