# Product Status Feature - Testing Guide

## Overview
This guide helps you test the complete product status tracking feature that displays order and delivery information dynamically in the ApartmentView.

## What Was Implemented

### Backend
1. **Product Model** - Added properties:
   - `order_status_info` - Returns array of orders containing this product
   - `delivery_status_info` - Returns array of deliveries for those orders
   - `combined_status_info` - Combined view of orders and deliveries

2. **Product Serializer** - Exposed new fields in API responses

3. **Order Serializer** - Fixed to properly link OrderItems to Products

4. **Management Command** - `fix_product_links` to fix existing orders

### Frontend
1. **ApartmentView** - Enhanced Product Status column to show:
   - Manual product status tags (editable)
   - Order status section (dynamic from database)
   - Delivery status section (dynamic from database)
   - "Not ordered yet" indicator when no orders exist

## Testing Checklist

### ✅ Step 1: Verify Existing Orders Are Fixed

1. Navigate to any apartment page (e.g., BRT APARTMENT)
2. Look at the Product Status column
3. **Expected**: Products that are in orders should show order information
4. **Not Expected**: "Not ordered yet" for products that have been ordered

**Example of correct display:**
```
Product Status:
[Design Approved] [Ordered]

Order Status:
[In Transit] po-2055666 (Qty: 2)
```

### ✅ Step 2: Test New Order Creation

1. Go to **Orders** → **Create Order**
2. Select an apartment (e.g., BRT APARTMENT)
3. Select products from that apartment
4. Fill in order details:
   - PO Number: `test-order-001`
   - Vendor: Select any vendor
   - Status: `confirmed`
   - Placed On: Today's date
5. Click **Create Order**
6. Navigate back to the apartment view
7. **Expected**: Selected products now show order status

### ✅ Step 3: Test Multiple Orders for Same Product

1. Create another order with the same product
2. Use different PO number: `test-order-002`
3. Navigate to apartment view
4. **Expected**: Product shows BOTH orders in the Order Status section

**Example:**
```
Order Status:
[Confirmed] test-order-001 (Qty: 2)
[Draft] test-order-002 (Qty: 1)
```

### ✅ Step 4: Test Order Status Changes

1. Go to **Orders** page
2. Find one of your test orders
3. Click to view/edit the order
4. Change status from `confirmed` to `in_transit`
5. Save the order
6. Navigate back to apartment view
7. **Expected**: Product status badge updates to show "In Transit"

### ✅ Step 5: Test Delivery Creation

1. Go to **Deliveries** page
2. Click **Create Delivery**
3. Link it to one of your test orders:
   - Select the apartment
   - Select the vendor
   - Enter the PO number as order reference
   - Set status: `Scheduled`
   - Set expected date
   - Add tracking number (optional)
4. Save the delivery
5. Navigate back to apartment view
6. **Expected**: Product now shows BOTH order and delivery status

**Example:**
```
Order Status:
[In Transit] test-order-001 (Qty: 2)

Delivery Status:
[Scheduled] test-order-001 (Track: TRK-123) ETA: 1/15/2026
```

### ✅ Step 6: Test Delivery Status Updates

1. Go to **Deliveries** page
2. Find your test delivery
3. Update status from `Scheduled` to `In Transit`
4. Update status to `Delivered`
5. Set actual delivery date
6. Navigate back to apartment view after each change
7. **Expected**: Delivery status badge updates in real-time

### ✅ Step 7: Test Product Without Orders

1. Add a new product to the apartment
2. Don't create any orders for it
3. Navigate to apartment view
4. **Expected**: Product shows "Not ordered yet"

### ✅ Step 8: Test Manual Status Tags

1. In apartment view, find any product
2. Click on the product status tags dropdown
3. Add/remove manual tags like "Damaged", "Wrong Item", etc.
4. **Expected**: Tags save and persist on page refresh

### ✅ Step 9: Test Clickable Links

1. In apartment view, find a product with orders
2. Click on the PO number link in Order Status section
3. **Expected**: Navigates to order detail page
4. Go back to apartment view
5. If delivery exists, click on order reference in Delivery Status
6. **Expected**: Navigates to deliveries page

### ✅ Step 10: Test Color Coding

Verify badge colors are correct:

**Order Status Colors:**
- Draft/Pending/Sent/Confirmed: Gray outline
- In Transit: Blue/Secondary
- Delivered: Green/Default
- Returned/Cancelled: Red/Destructive

**Delivery Status Colors:**
- Scheduled: Yellow background
- In Transit: Blue background
- Delivered: Green background
- Delayed: Orange background
- Returned/Cancelled: Red background

## API Testing

### Test API Response Structure

```bash
# Get products for an apartment
curl -X GET "http://localhost:8000/api/products/?apartment=<apartment-id>" \
  -H "Authorization: Bearer <token>"
```

**Expected Response Structure:**
```json
{
  "id": "product-uuid",
  "product": "Product Name",
  "order_status_info": [
    {
      "status": "in_transit",
      "po_number": "po-2055666",
      "order_id": "order-uuid",
      "placed_on": "2025-12-27",
      "quantity": 2
    }
  ],
  "delivery_status_info": [
    {
      "status": "In Transit",
      "order_reference": "po-2055666",
      "delivery_id": "delivery-uuid",
      "expected_date": "2025-12-25",
      "actual_date": null,
      "tracking_number": "trk-34324",
      "priority": "Medium"
    }
  ],
  "combined_status_info": {
    "orders": [...],
    "deliveries": [...],
    "is_ordered": true,
    "has_active_order": true
  }
}
```

## Edge Cases to Test

### 1. Product in Multiple Orders with Different Statuses
- Create 3 orders with same product
- Set different statuses: draft, confirmed, in_transit
- **Expected**: All 3 orders show in Product Status

### 2. Order Without Delivery
- Create order but don't create delivery
- **Expected**: Only Order Status section shows, no Delivery Status

### 3. Delivery Without Tracking Number
- Create delivery without tracking number
- **Expected**: Delivery shows but tracking info is hidden

### 4. Product Name Mismatch
- Create order with slightly different product name
- **Expected**: Management command should still link by name matching

### 5. Deleted Product
- Create order with product
- Delete the product from apartment
- **Expected**: Order still shows product name, but link is broken (graceful degradation)

## Performance Testing

### Test with Large Dataset
1. Create apartment with 100+ products
2. Create 50+ orders
3. Navigate to apartment view
4. **Expected**: Page loads within 2-3 seconds
5. Check browser console for errors
6. Verify no N+1 query issues

## Common Issues and Solutions

### Issue 1: "Not ordered yet" shows despite orders existing
**Solution**: Run `python3 manage.py fix_product_links`

### Issue 2: Order status not updating
**Solution**: 
- Check if product FK is set in OrderItem
- Verify API is returning order_status_info
- Check browser console for errors

### Issue 3: Delivery status not showing
**Solution**:
- Verify delivery is linked to order (order FK must be set)
- Check if order has the product
- Verify API returns delivery_status_info

### Issue 4: Multiple duplicate entries
**Solution**: This is expected if product appears in multiple orders

## Success Criteria

✅ All 32 existing OrderItems are linked to Products  
✅ New orders automatically link products  
✅ Order status displays correctly in ApartmentView  
✅ Delivery status displays when deliveries exist  
✅ Status badges have correct colors  
✅ Clickable links navigate correctly  
✅ "Not ordered yet" only shows for products without orders  
✅ Multiple orders for same product all display  
✅ Page performance is acceptable  
✅ No console errors  

## Rollback Plan

If issues occur, you can rollback:

1. **Backend**: Revert changes to:
   - `/root/buy2rent/backend/products/models.py`
   - `/root/buy2rent/backend/products/serializers.py`
   - `/root/buy2rent/backend/orders/serializers.py`

2. **Frontend**: Revert changes to:
   - `/root/buy2rent/frontend/src/pages/ApartmentView.tsx`

3. **Database**: OrderItem product links will remain (no harm)

## Support

If you encounter issues:
1. Check browser console for JavaScript errors
2. Check backend logs: `pm2 logs buy2rent-backend`
3. Verify API responses using browser DevTools Network tab
4. Run management command again if needed
5. Check documentation files:
   - `PRODUCT_STATUS_TRACKING_IMPLEMENTATION.md`
   - `ORDER_PRODUCT_LINKING_FIX.md`
