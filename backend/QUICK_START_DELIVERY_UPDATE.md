# Quick Start: Delivery Fields Update

## What Was Done

Updated the backend to support all delivery fields from the frontend, including:
- Delivery status tags
- Sender/recipient information
- Parcel locker details
- Pickup point details
- International shipping (customs, HS codes)
- Additional options (insurance, COD, special instructions)

## Files Changed

1. ✅ `products/models.py` - Added 20 new delivery fields
2. ✅ `products/serializers.py` - Added fields to API
3. ✅ `products/admin.py` - Updated Django admin interface
4. ✅ `products/migrations/0007_add_delivery_fields.py` - Database migration

## How to Apply

### Step 1: Run the Migration

```bash
cd backend
python manage.py migrate products
```

Expected output:
```
Running migrations:
  Applying products.0007_add_delivery_fields... OK
```

### Step 2: Verify Installation

```bash
python test_delivery_fields.py
```

This will check:
- ✅ All 20 fields exist in the model
- ✅ All fields are in the serializer
- ✅ Field properties are correct

### Step 3: Test the API

Create a product with delivery fields:

```bash
curl -X POST http://localhost:8000/api/products/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "apartment": "YOUR_APARTMENT_UUID",
    "category": "YOUR_CATEGORY_UUID",
    "product": "Test Delivery Product",
    "vendor": "YOUR_VENDOR_UUID",
    "unit_price": "1000",
    "qty": 1,
    "delivery_type": "home_courier",
    "sender": "My Company",
    "sender_address": "123 Business St, Budapest",
    "sender_phone": "+36 20 123 4567",
    "recipient": "John Doe",
    "recipient_address": "456 Home Ave, Budapest",
    "recipient_phone": "+36 30 987 6543",
    "recipient_email": "john@example.com",
    "insurance": "yes",
    "cod": "1000"
  }'
```

### Step 4: Test in Frontend

1. Start frontend: `npm run dev`
2. Navigate to an apartment
3. Click "Add Product"
4. Go to "Delivery" tab
5. Select "Home Courier" delivery type
6. Fill in the delivery fields
7. Save and verify data persists

## Delivery Types Supported

### 🚚 Home Courier
- Sender information (name, address, phone)
- Recipient information (name, address, phone, email)
- Weight, size, insurance, COD

### 📦 Parcel Locker
- Locker provider (e.g., Packeta, GLS ParcelShop)
- Locker ID
- Recipient information
- Weight, size, COD

### 🏪 Pickup Point
- Pickup provider (e.g., DPD Pickup, GLS Point)
- Pickup location
- Recipient information
- Weight, size, COD

### ✈️ International
- Sender and recipient information
- Customs description
- Item value
- HS category code
- Insurance

### ⚡ Same Day
- Pickup time
- Delivery deadline
- Special instructions

## Troubleshooting

### Migration Error
If you get an error running the migration:

```bash
# Check migration status
python manage.py showmigrations products

# If needed, fake the migration (only if fields already exist)
python manage.py migrate products 0007 --fake
```

### Fields Not Showing in Admin
1. Clear browser cache
2. Restart Django server
3. Check admin.py was updated correctly

### API Not Returning New Fields
1. Verify migration ran successfully
2. Check serializer.py includes all fields
3. Restart Django server

### Frontend Not Saving Fields
1. Check browser console for errors
2. Verify API response includes the fields
3. Check network tab to see what's being sent

## Rollback (If Needed)

To rollback the changes:

```bash
# Rollback migration
python manage.py migrate products 0006

# Then manually revert code changes
git checkout HEAD -- products/models.py
git checkout HEAD -- products/serializers.py
git checkout HEAD -- products/admin.py
```

## Support Files

- 📄 `DELIVERY_FIELDS_UPDATE.md` - Detailed documentation
- 🧪 `test_delivery_fields.py` - Verification script
- 🗄️ `products/migrations/0007_add_delivery_fields.py` - Database migration

## Quick Reference: New Fields

| Field | Type | Description |
|-------|------|-------------|
| delivery_status_tags | String | Comma-separated status tags |
| sender | String | Sender name |
| sender_address | Text | Sender full address |
| sender_phone | String | Sender phone |
| recipient | String | Recipient name |
| recipient_address | Text | Recipient address |
| recipient_phone | String | Recipient phone |
| recipient_email | Email | Recipient email |
| locker_provider | String | Parcel locker provider |
| locker_id | String | Locker ID/code |
| pickup_provider | String | Pickup point provider |
| pickup_location | String | Pickup location |
| customs_description | Text | Customs declaration |
| item_value | String | Item value for customs |
| hs_category | String | HS category code |
| insurance | String | yes/no (default: no) |
| cod | String | Cash on delivery amount |
| pickup_time | String | Pickup time |
| delivery_deadline | String | Delivery deadline |
| special_instructions | Text | Special instructions |

## Next Steps

After successful deployment:

1. ✅ Update any documentation
2. ✅ Train users on new delivery features
3. ✅ Monitor for any issues
4. ✅ Consider adding delivery tracking integration
5. ✅ Add delivery reports/analytics

## Questions?

Check the detailed documentation in `DELIVERY_FIELDS_UPDATE.md`
