# Product Image Handling - Standardization Guide

## Overview

All product images are now standardized to use a **single field**: `product_image`

This ensures consistency across all operations: manual uploads, Excel imports, API calls, and display.

## Architecture

### Database Schema

**Primary Field:**
- `product_image` (URLField) - The single source of truth for product images

**Deprecated Fields (kept for backward compatibility):**
- `image_url` (URLField) - Legacy field, no longer used
- `image_file` (ImageField) - Legacy field, no longer used

### Image Priority Logic

The serializer uses the following priority when reading images:
1. `product_image` (primary)
2. `image_file` (backward compatibility)
3. `image_url` (backward compatibility)

When writing/uploading images, everything goes to `product_image`.

## Usage Guide

### 1. Manual Product Creation (Frontend)

When creating a product via the "Add Product" form:
- Upload image via the file input
- Image is sent as `image_file` in FormData
- Backend saves to `image_file` field
- Backend automatically copies URL to `product_image`
- Frontend displays from `product_image`

**Code Example:**
```typescript
// Frontend - ProductAdd.tsx
const formData = new FormData();
formData.append('image_file', imageFile);
// ... other fields
await productApi.createProduct(formData);
```

```python
# Backend - views.py
def perform_create(self, serializer):
    instance = serializer.save()
    self._handle_image_upload(instance)  # Copies to product_image
```

### 2. Product Update (Frontend)

When updating a product:
- Upload new image via file input
- Image sent as `image_file` in FormData
- Backend updates both `image_file` and `product_image`

**Code Example:**
```typescript
// Frontend - ProductEdit.tsx
const formData = new FormData();
formData.append('image_file', imageFile);
// ... other fields
await productApi.updateProduct(id, formData);
```

### 3. Excel/CSV Import

When importing products from Excel:
- **Embedded images**: Extracted and saved to `/media/apartment_products/`
- **URL-based images**: Downloaded and saved locally (optional)
- All images stored in `product_image` field

**Column Mapping:**
Any of these column names will map to `product_image`:
- `product_image`
- `product image`
- `image`
- `photo`
- `picture`
- `image_url`
- `photo_url`
- `picture_url`

**Code Example:**
```python
# Backend - import_service.py
# Embedded images
product.product_image = image_path
product.save(update_fields=['product_image'])

# URL-based images
self._process_product_image(product, image_url)
```

### 4. API Usage

**GET Request:**
```json
{
  "id": "123",
  "product": "Modern Sofa",
  "product_image": "https://procurement.buy2rent.eu/media/products/sofa.jpg"
}
```

**POST/PATCH with File Upload:**
```bash
curl -X POST https://procurement.buy2rent.eu/products/ \
  -H "Authorization: Bearer <token>" \
  -F "product=Modern Sofa" \
  -F "image_file=@/path/to/image.jpg" \
  -F "category=123" \
  -F "vendor=456"
```

**POST/PATCH with URL:**
```json
{
  "product": "Modern Sofa",
  "product_image": "https://example.com/image.jpg",
  "category": "123",
  "vendor": "456"
}
```

### 5. Display (Frontend)

All components should use `product_image` only:

```tsx
// ✅ Correct
{product.product_image ? (
  <img src={product.product_image} alt={product.product} />
) : (
  <div>No image</div>
)}

// ❌ Incorrect (deprecated)
{(product.product_image || product.image_url) ? (
  <img src={product.product_image || product.image_url} />
) : (
  <div>No image</div>
)}
```

## Migration & Consolidation

### Consolidate Existing Images

If you have products with images in the old fields, run:

```bash
# Dry run to see what would change
python manage.py consolidate_images --dry-run

# Apply changes
python manage.py consolidate_images
```

### Test Image Consolidation

To verify all images are properly consolidated:

```bash
python manage.py test_image_consolidation
```

## File Structure

### Backend Files
- `products/models.py` - Product model with image fields
- `products/serializers.py` - Serializer with unified image handling
- `products/views.py` - ViewSet with image upload handling
- `products/import_service.py` - Excel import with image extraction
- `products/management/commands/consolidate_images.py` - Consolidation script
- `products/management/commands/test_image_consolidation.py` - Test script

### Frontend Files
- `services/productApi.ts` - Product TypeScript interface
- `pages/ProductAdd.tsx` - Product creation form
- `pages/ProductEdit.tsx` - Product edit form
- `pages/ProductView.tsx` - Product detail view
- `pages/ApartmentView.tsx` - Product list with images
- `components/ProductCard.tsx` - Product card component

## Best Practices

1. **Always use `product_image`** for all new code
2. **Never write to `image_url` or `image_file`** directly (except via the upload handler)
3. **Test imports** with both embedded and URL-based images
4. **Validate image URLs** before storing
5. **Use fallback placeholders** when no image exists

## Troubleshooting

### Issue: Image not displaying after upload

**Check:**
1. Is `product_image` populated in the database?
2. Is the URL accessible (check MEDIA_URL settings)?
3. Are CORS headers configured correctly?

**Solution:**
```bash
# Check database
python manage.py shell
>>> from products.models import Product
>>> p = Product.objects.get(id='<product-id>')
>>> print(p.product_image)

# Run consolidation
python manage.py consolidate_images
```

### Issue: Excel import not extracting images

**Check:**
1. Are images embedded in Excel (not just links)?
2. Is openpyxl installed?
3. Check import logs for errors

**Solution:**
```bash
# Check logs
pm2 logs buy2rent-backend

# Test with a simple Excel file first
```

### Issue: Old products showing no images

**Solution:**
Run the consolidation command to migrate old image data:
```bash
python manage.py consolidate_images
```

## API Reference

### Endpoints

**List Products**
```
GET /products/
GET /products/by_apartment/?apartment_id=<id>
```

**Get Product**
```
GET /products/<id>/
```

**Create Product**
```
POST /products/
Content-Type: multipart/form-data or application/json
```

**Update Product**
```
PATCH /products/<id>/
Content-Type: multipart/form-data or application/json
```

**Import Products**
```
POST /products/import_excel/
Content-Type: multipart/form-data
Fields: file, apartment_id, vendor_id
```

## Summary

✅ **Single source of truth**: `product_image`  
✅ **Backward compatible**: Old fields still readable  
✅ **Consistent behavior**: Same field for all operations  
✅ **Easy migration**: Automated consolidation script  
✅ **Well documented**: Clear usage patterns  

For questions or issues, refer to the code comments or contact the development team.
