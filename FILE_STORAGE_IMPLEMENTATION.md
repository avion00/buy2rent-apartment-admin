# File Storage Implementation for Excel/CSV Imports

## Overview

The system now permanently stores uploaded Excel/CSV files on the backend server and extracts data from these saved files. This allows you to:

1. **Keep a record** of all uploaded files
2. **Re-process** files if needed
3. **Download** original files later
4. **Audit** what was imported and when

## Changes Made

### 1. Database Model Updates

**File:** `backend/products/category_models.py`

Added `uploaded_file` field to `ImportSession` model:

```python
uploaded_file = models.FileField(
    upload_to='import_files/%Y/%m/%d/',
    null=True,
    blank=True,
    help_text="Uploaded Excel/CSV file stored on server"
)
```

**Storage Location:** Files are organized by date in `media/import_files/YYYY/MM/DD/`

### 2. Import Service Updates

**File:** `backend/products/import_service.py`

- Files are now saved permanently when creating ImportSession
- No longer uses temporary files that get deleted
- Uses the saved file path for processing
- Added detailed logging for image extraction

### 3. API Updates

**File:** `backend/products/serializers.py`

Added `uploaded_file_url` field to `ImportSessionSerializer`:
- Returns the full URL to download the file
- Accessible via API responses

### 4. Admin Interface Updates

**File:** `backend/products/admin.py`

- Added download link in list view
- Shows file field in detail view
- Click to download original file

## File Storage Structure

```
media/
└── import_files/
    └── 2025/
        └── 12/
            └── 01/
                ├── apartment_name_demolist.xlsx
                ├── products_import_20251201.csv
                └── ...
```

## How It Works

### 1. Upload Process

When you upload a file via API:

```
POST /api/products/import_excel/
POST /api/products/create_apartment_and_import/
```

The system:
1. ✅ Validates the file (format, size)
2. ✅ Creates an ImportSession record
3. ✅ **Saves the file permanently** to `media/import_files/YYYY/MM/DD/`
4. ✅ Extracts embedded images to `media/apartment_products/{apartment_id}/{category}/`
5. ✅ Processes data and creates products
6. ✅ Updates ImportSession with results

### 2. File Access

**Via API:**
```json
{
  "id": "session-uuid",
  "file_name": "products.xlsx",
  "uploaded_file": "/media/import_files/2025/12/01/products.xlsx",
  "uploaded_file_url": "http://localhost:8000/media/import_files/2025/12/01/products.xlsx",
  "status": "completed",
  ...
}
```

**Via Django Admin:**
- Navigate to Products → Import Sessions
- Click "Download File" link to get the original file

### 3. Image Extraction

Images are extracted from Excel files and stored separately:

```
media/
└── apartment_products/
    └── {apartment_id}/
        ├── heating/
        │   ├── row_2_img_1_abc123.png
        │   ├── row_3_img_2_def456.png
        │   └── row_4_img_3_ghi789.png
        ├── laminated_floors/
        │   └── row_2_img_1_jkl012.jpeg
        └── walpapers/
            └── row_2_img_1_mno345.png
```

## Migration Steps

### Step 1: Apply Database Migration

```bash
cd backend
python apply_file_storage_migration.py
```

Or manually:

```bash
cd backend
python manage.py makemigrations products
python manage.py migrate products
```

### Step 2: Test the Implementation

1. **Upload a new Excel file:**
   ```bash
   # Use Postman or curl
   curl -X POST http://localhost:8000/api/products/import_excel/ \
     -F "file=@your_file.xlsx" \
     -F "apartment_id=your-apartment-uuid"
   ```

2. **Check the saved file:**
   ```bash
   ls -la backend/media/import_files/2025/12/01/
   ```

3. **Verify in Django Admin:**
   - Go to http://localhost:8000/admin/products/importsession/
   - Check the "Download" column
   - Click to download the original file

### Step 3: Check Image Extraction

1. **View server logs** for detailed image extraction info:
   ```
   Found 3 images in sheet 'Heating'
   Processing image 1 at row 2 in sheet 'Heating'
   ✅ Extracted image for row 2: /media/apartment_products/.../row_2_img_1.png
   ✅ Assigned embedded image to product 'boiler' (row 2): /media/...
   ```

2. **Check saved images:**
   ```bash
   ls -la backend/media/apartment_products/{apartment-id}/
   ```

3. **Verify in API response:**
   ```json
   {
     "product": "boiler",
     "product_image": "http://localhost:8000/media/apartment_products/.../row_2_img_1.png",
     "image_url": "http://localhost:8000/media/apartment_products/.../row_2_img_1.png",
     "imageUrl": "http://localhost:8000/media/apartment_products/.../row_2_img_1.png"
   }
   ```

## API Endpoints

### Import Excel/CSV

**Endpoint:** `POST /api/products/import_excel/`

**Request:**
```
Content-Type: multipart/form-data

file: [Excel/CSV file]
apartment_id: [UUID]
```

**Response:**
```json
{
  "success": true,
  "message": "Import completed successfully",
  "data": {
    "total_products": 10,
    "successful_imports": 10,
    "failed_imports": 0,
    "sheets_processed": 3,
    "errors": []
  }
}
```

### Create Apartment and Import

**Endpoint:** `POST /api/products/create_apartment_and_import/`

**Request:**
```
Content-Type: multipart/form-data

file: [Excel/CSV file]
apartment_name: "My Apartment"
apartment_type: "furnishing"
owner: "John Doe"
status: "Planning"
designer: "Jane Smith"
start_date: "2025-01-01"
due_date: "2025-12-31"
address: "123 Main St"
```

### Get Import Sessions

**Endpoint:** `GET /api/products/import_sessions/?apartment_id={uuid}`

**Response:**
```json
[
  {
    "id": "session-uuid",
    "apartment": "apartment-uuid",
    "apartment_name": "My Apartment",
    "file_name": "products.xlsx",
    "file_size": 1048576,
    "file_type": "xlsx",
    "uploaded_file": "/media/import_files/2025/12/01/products.xlsx",
    "uploaded_file_url": "http://localhost:8000/media/import_files/2025/12/01/products.xlsx",
    "total_sheets": 3,
    "total_products": 10,
    "successful_imports": 10,
    "failed_imports": 0,
    "status": "completed",
    "error_log": [],
    "started_at": "2025-12-01T10:00:00Z",
    "completed_at": "2025-12-01T10:00:05Z",
    "duration": 5.0
  }
]
```

## Troubleshooting

### Images Not Showing

1. **Check server logs** for image extraction messages
2. **Verify images were extracted:**
   ```bash
   ls -la backend/media/apartment_products/{apartment-id}/
   ```
3. **Check product_image field** in database:
   ```python
   python manage.py shell
   >>> from products.models import Product
   >>> p = Product.objects.first()
   >>> print(p.product_image)
   >>> print(p.image_url)
   ```

### File Not Saved

1. **Check media directory exists:**
   ```bash
   ls -la backend/media/
   ```
2. **Check permissions:**
   ```bash
   chmod -R 755 backend/media/
   ```
3. **Check Django settings:**
   ```python
   MEDIA_ROOT = BASE_DIR / 'media'
   MEDIA_URL = '/media/'
   ```

### Row Number Mismatch

The system uses this mapping:
- Excel row 1 = Header (skipped)
- Excel row 2 = DataFrame index 0 = import_row_number 2
- Excel row 3 = DataFrame index 1 = import_row_number 3
- Excel row 4 = DataFrame index 2 = import_row_number 4

Images are matched by Excel row number.

## Benefits

✅ **Audit Trail:** Keep original files for reference  
✅ **Re-processing:** Can re-import if needed  
✅ **Debugging:** Check original file if data looks wrong  
✅ **Compliance:** Meet data retention requirements  
✅ **Image Extraction:** Embedded images are properly extracted and stored  
✅ **Organized Storage:** Files organized by date and apartment  

## Notes

- Old import sessions (before this update) will have `uploaded_file = null`
- File size limit: 50MB (configurable in `import_service.py`)
- Supported formats: `.xlsx`, `.xls`, `.csv`
- Images are extracted only from Excel files (not CSV)
- Image formats supported: PNG, JPG, JPEG, GIF

## Next Steps

1. ✅ Apply the migration
2. ✅ Test with a new upload
3. ✅ Verify files are saved
4. ✅ Check images are extracted
5. ✅ Confirm API returns image URLs
