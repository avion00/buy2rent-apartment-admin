# Product Delivery Fields Update

## Summary
Updated the backend Product model, serializers, and admin to match the frontend delivery field structure. The frontend has extensive delivery fields for different delivery types (home courier, parcel locker, pickup point, international, same-day) that were missing from the backend.

## Changes Made

### 1. Model Updates (`products/models.py`)
Added 20 new delivery-related fields to the Product model:

#### Basic Delivery Information
- `delivery_status_tags` - Comma-separated delivery status tags

#### Sender Information (for courier/international)
- `sender` - Sender name
- `sender_address` - Sender full address
- `sender_phone` - Sender phone number

#### Recipient Information (for all delivery types)
- `recipient` - Recipient name
- `recipient_address` - Recipient full address
- `recipient_phone` - Recipient phone number
- `recipient_email` - Recipient email address

#### Parcel Locker Specific
- `locker_provider` - Locker provider name (e.g., Packeta, GLS ParcelShop)
- `locker_id` - Locker ID or code

#### Pickup Point Specific
- `pickup_provider` - Pickup point provider (e.g., DPD Pickup, GLS Point)
- `pickup_location` - Pickup point location or address

#### International Delivery Specific
- `customs_description` - Customs declaration description
- `item_value` - Declared item value for customs
- `hs_category` - HS (Harmonized System) category code

#### Additional Delivery Options
- `insurance` - Insurance: yes or no (default: 'no')
- `cod` - Cash on Delivery amount
- `pickup_time` - Pickup time for same-day delivery
- `delivery_deadline` - Delivery deadline
- `special_instructions` - Special delivery instructions

### 2. Serializer Updates (`products/serializers.py`)
- Added all 20 new delivery fields to the `ProductSerializer` fields list
- Fields are automatically handled by Django REST Framework
- All fields are optional (blank=True) to maintain backward compatibility

### 3. Migration Created (`products/migrations/0007_add_delivery_fields.py`)
- Created migration file to add all new fields to the database
- All fields are nullable and have blank=True for backward compatibility
- **IMPORTANT**: You need to run this migration with:
  ```bash
  python manage.py migrate products
  ```

### 4. Admin Interface Updates (`products/admin.py`)
- Added all new delivery fields to `list_display` for visibility in admin list view
- Organized delivery fields into logical fieldsets:
  - **Delivery - Basic**: Core delivery information
  - **Delivery - Sender/Recipient**: Sender and recipient details (collapsed by default)
  - **Delivery - Type Specific**: Locker, pickup, and international fields (collapsed by default)
  - **Delivery - Additional Options**: Insurance, COD, special instructions (collapsed by default)

### 5. API Endpoints (`products/views.py`)
- No changes needed - the ViewSet automatically handles all serializer fields
- All CRUD operations (Create, Read, Update, Delete) will now support the new delivery fields
- Existing endpoints remain unchanged and backward compatible

## Frontend Delivery Types Supported

The frontend supports these delivery types with specific fields:

1. **None** - No delivery required
2. **Home Courier** 🚚 - Uses sender/recipient information, weight, size, insurance, COD
3. **Parcel Locker** 📦 - Uses locker provider, locker ID, recipient info, weight, size, COD
4. **Pickup Point** 🏪 - Uses pickup provider, pickup location, recipient info, weight, size, COD
5. **International** ✈️ - Uses sender/recipient, customs description, item value, HS category, insurance
6. **Same Day** ⚡ - Uses pickup time, delivery deadline, special instructions

## Next Steps

### 1. Apply the Migration
Run the migration to update your database:
```bash
cd backend
source venv/bin/activate  # On Linux/Mac
# OR
venv\Scripts\activate  # On Windows

python manage.py migrate products
```

### 2. Test the API
Test that the new fields work correctly:

#### Create a product with delivery fields:
```bash
curl -X POST http://localhost:8000/api/products/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "apartment": "APARTMENT_UUID",
    "category": "CATEGORY_UUID",
    "product": "Test Product",
    "vendor": "VENDOR_UUID",
    "unit_price": "1000",
    "qty": 1,
    "delivery_type": "home_courier",
    "sender": "Company Name",
    "sender_address": "123 Main St",
    "sender_phone": "+36 20 123 4567",
    "recipient": "Customer Name",
    "recipient_address": "456 Oak Ave",
    "recipient_phone": "+36 30 987 6543",
    "recipient_email": "customer@example.com",
    "insurance": "yes",
    "cod": "1000"
  }'
```

#### Retrieve and verify:
```bash
curl -X GET http://localhost:8000/api/products/PRODUCT_UUID/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Verify in Django Admin
1. Go to http://localhost:8000/admin/products/product/
2. Click on any product
3. Scroll to the "Delivery" sections
4. Verify all new fields are visible and editable

### 4. Test Frontend Integration
1. Start the frontend application
2. Navigate to an apartment view
3. Click "Add Product"
4. Go to the "Delivery" tab
5. Select different delivery types and verify all fields work correctly
6. Save the product and verify data is persisted

## Backward Compatibility

All changes are backward compatible:
- All new fields are optional (blank=True, null where appropriate)
- Existing products without delivery data will continue to work
- API responses include new fields but they will be null/empty for existing products
- Frontend handles missing data gracefully

## Database Schema

The migration adds these columns to the `products_product` table:
- `delivery_status_tags` (VARCHAR 255)
- `sender` (VARCHAR 255)
- `sender_address` (TEXT)
- `sender_phone` (VARCHAR 20)
- `recipient` (VARCHAR 255)
- `recipient_address` (TEXT)
- `recipient_phone` (VARCHAR 20)
- `recipient_email` (VARCHAR 254)
- `locker_provider` (VARCHAR 100)
- `locker_id` (VARCHAR 100)
- `pickup_provider` (VARCHAR 100)
- `pickup_location` (VARCHAR 255)
- `customs_description` (TEXT)
- `item_value` (VARCHAR 100)
- `hs_category` (VARCHAR 100)
- `insurance` (VARCHAR 10, default='no')
- `cod` (VARCHAR 100)
- `pickup_time` (VARCHAR 100)
- `delivery_deadline` (VARCHAR 100)
- `special_instructions` (TEXT)

## Files Modified

1. `backend/products/models.py` - Added 20 new delivery fields
2. `backend/products/serializers.py` - Added fields to serializer
3. `backend/products/admin.py` - Updated admin interface
4. `backend/products/migrations/0007_add_delivery_fields.py` - New migration file

## Testing Checklist

- [ ] Run migration successfully
- [ ] Create product with delivery fields via API
- [ ] Update product delivery fields via API
- [ ] Retrieve product and verify delivery fields
- [ ] Test each delivery type in frontend
- [ ] Verify fields appear in Django admin
- [ ] Test backward compatibility with existing products
- [ ] Export products to CSV and verify new fields included

## Support

If you encounter any issues:
1. Check that the migration ran successfully
2. Verify the serializer includes all fields
3. Check Django admin for field visibility
4. Review API responses for new fields
5. Check browser console for frontend errors
