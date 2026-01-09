# Order-Product Linking Issue and Fix

## Problem

When viewing products in the ApartmentView page, products show "Not ordered yet" even though they have been added to orders. This happens because the `OrderItem` records are not properly linked to the `Product` records via the foreign key relationship.

## Root Cause

The frontend sends `product: item.productId` when creating orders, which should link OrderItems to Products. However, existing orders in the database may have OrderItems without the `product` foreign key set, causing the `order_status_info` property to return empty arrays.

## Solution Implemented

### 1. Backend Serializer Fix (`/root/buy2rent/backend/orders/serializers.py`)

**Updated the `create` method:**
- Now properly handles the `product` field when it's sent from the frontend
- Stores product image URL at order creation time
- Falls back to name-based matching if product FK is not provided

**Updated the `update` method:**
- Maintains product links when updating orders
- Ensures product images are captured

### 2. Management Command Created

Created `/root/buy2rent/backend/orders/management/commands/fix_product_links.py` to fix existing orders:

```bash
python3 manage.py fix_product_links
```

This command:
- Finds all OrderItems without product links
- Attempts to match them by product name and apartment
- Falls back to SKU matching if name match fails
- Updates the product foreign key and stores product images

## How to Fix Existing Orders

### Option 1: Run the Management Command (Recommended)

```bash
cd /root/buy2rent/backend
python3 manage.py fix_product_links
```

This will automatically link all existing OrderItems to their corresponding Products.

### Option 2: Manual Database Fix

If Django environment is not available, you can run this SQL directly:

```sql
-- For SQLite
UPDATE orders_orderitem 
SET product_id = (
    SELECT p.id 
    FROM products_product p 
    WHERE p.product = orders_orderitem.product_name 
    AND p.apartment_id = (
        SELECT apartment_id 
        FROM orders_order 
        WHERE orders_order.id = orders_orderitem.order_id
    )
    LIMIT 1
)
WHERE product_id IS NULL;
```

### Option 3: Recreate the Orders

Delete existing orders and create them again through the UI. The new serializer will properly link products.

## Verification

After fixing, verify by:

1. Go to ApartmentView page
2. Check the Product Status column
3. You should now see:
   - **Order Status** section showing order details
   - **Delivery Status** section (if deliveries exist)
   - Order PO numbers as clickable links
   - Quantities and status badges

## Example of Fixed Display

**Before Fix:**
```
Product Status: [Design Approved]
Not ordered yet
```

**After Fix:**
```
Product Status: [Design Approved]

Order Status:
[In Transit] po-2055666 (Qty: 2)

Delivery Status:
[In Transit] po-2055666 (Track: trk-64124) ETA: 12/25/2025
```

## Future Prevention

The serializer has been updated to ensure all new orders will automatically link products correctly. The frontend already sends the correct `productId`, so this issue should not occur for new orders.

## Files Modified

1. `/root/buy2rent/backend/orders/serializers.py` - Improved product linking logic
2. `/root/buy2rent/backend/orders/management/commands/fix_product_links.py` - New management command
3. `/root/buy2rent/backend/products/models.py` - Added delivery_status_info property
4. `/root/buy2rent/backend/products/serializers.py` - Added delivery tracking fields
5. `/root/buy2rent/frontend/src/pages/ApartmentView.tsx` - Enhanced status display

## Testing

1. Create a new order with products from an apartment
2. View the apartment page
3. Verify products show order status in the Product Status column
4. Create a delivery for the order
5. Verify delivery status also appears

## Notes

- The `product` field in OrderItem is optional (nullable) to support historical orders or orders for products not in the system
- Product matching is case-insensitive
- SKU matching is used as fallback if name matching fails
- Product images are stored at order time to preserve historical data
