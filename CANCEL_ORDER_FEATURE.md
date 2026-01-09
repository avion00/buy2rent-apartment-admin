# Cancel Order Feature ✅

## Overview

Orders can now be cancelled from the Orders page before vendor confirmation. The "Cancelled" status has been moved from Deliveries to Orders, as orders should be cancelled before delivery fulfillment begins.

## Changes Made

### 1. Backend - Order Model
**File**: `/root/buy2rent/backend/orders/models.py`

Added 'cancelled' status to Order model:
```python
STATUS_CHOICES = [
    ('draft', 'Draft'),
    ('sent', 'Sent'),
    ('cancelled', 'Cancelled'),
]
```

### 2. Frontend - Orders Page
**File**: `/root/buy2rent/frontend/src/pages/Orders.tsx`

Added "Cancel Order" button in order actions menu:
- Shows for Draft and Sent orders only
- Orange color to indicate caution
- Placed before "Delete Order" in danger zone

```tsx
{(order.status.toLowerCase() === 'draft' || order.status.toLowerCase() === 'sent') && (
  <DropdownMenuItem 
    onClick={() => updateStatus(String(order.id), 'cancelled')}
    className="cursor-pointer py-2.5 text-orange-600 focus:text-orange-600 focus:bg-orange-500/10"
  >
    <XCircle className="mr-3 h-4 w-4" />
    <span>Cancel Order</span>
  </DropdownMenuItem>
)}
```

### 3. Delivery Status Dialog
**File**: `/root/buy2rent/frontend/src/components/deliveries/DeliveryStatusUpdate.tsx`

Removed "Cancelled" status option:
- Only shows: Confirmed, In Transit, Received, Returned
- Cancelled logic removed from validation and status notes
- Updated form fields to handle only 4 statuses

### 4. Deliveries Page
**File**: `/root/buy2rent/frontend/src/pages/Deliveries.tsx`

Updated to remove Cancelled references:
- Removed from status filter dropdown
- Updated statistics card from "Cancelled/Returned" to "Returned"
- Removed from getStatusColor function

### 5. ApartmentView
**File**: `/root/buy2rent/frontend/src/pages/ApartmentView.tsx`

Updated delivery status badge display:
- Removed Cancelled color coding
- Only shows: Confirmed, In Transit, Received, Returned

## Workflow

### Order Cancellation

**When to Cancel:**
- Order is in Draft status (not yet sent)
- Order is Sent but vendor hasn't confirmed yet

**How to Cancel:**
1. Go to Orders page
2. Find the order (Draft or Sent status)
3. Click actions menu (•••)
4. Click "Cancel Order"
5. Order status changes to "Cancelled"

**What Happens:**
- Order marked as cancelled
- No delivery created (if Draft)
- Existing delivery remains but order is cancelled (if Sent)

### Delivery Returns

**When to Return:**
- Items were received but need to be sent back
- Quality issues, wrong items, etc.

**How to Return:**
1. Go to Deliveries page
2. Find the delivery
3. Click "Update Status"
4. Select "Returned"
5. Enter reason for return

## Status Progression

### Orders Page
```
Draft → Sent → (Cancelled at any point)
```

### Deliveries Page
```
Confirmed → In Transit → Received
                      ↓
                   Returned
```

## Key Differences

### Cancel Order (Orders Page)
- **When**: Before vendor confirmation
- **Why**: Order not needed, mistake, vendor can't fulfill
- **Where**: Orders page
- **Status**: Cancelled

### Return Delivery (Deliveries Page)
- **When**: After items received
- **Why**: Quality issues, wrong items, defects
- **Where**: Deliveries page
- **Status**: Returned

## User Interface

### Orders Page - Actions Menu
```
ORDER ACTIONS
├── View Details
├── Edit Order
├── Copy PO Number
│
STATUS & DELIVERY
├── Update Status
├── Delivery Tracking
├── Mark as Sent (Draft orders only)
│
DANGER ZONE
├── Cancel Order (Draft/Sent orders only) 🆕
└── Delete Order
```

### Deliveries Page - Status Options
```
Update Delivery Status
├── Confirmed
├── In Transit
├── Received
└── Returned
```

## Benefits

1. ✅ **Clear Separation**: Cancel orders before fulfillment, return items after receipt
2. ✅ **Logical Flow**: Orders cancelled early, deliveries returned later
3. ✅ **User Friendly**: Cancel button in Orders page where orders are managed
4. ✅ **Prevents Confusion**: No "cancelled delivery" - only cancelled orders
5. ✅ **Real-World Match**: Matches actual procurement workflow

## Testing

### Test Cancel Order

1. **Create Draft Order**
   - Orders page → New Order → Save
   - Expected: Order with status "Draft"

2. **Cancel Draft Order**
   - Order actions → Cancel Order
   - Expected: Order status changes to "Cancelled"

3. **Send Order**
   - Create another order
   - Mark as Sent
   - Expected: Order status "Sent", delivery created

4. **Cancel Sent Order**
   - Order actions → Cancel Order
   - Expected: Order status changes to "Cancelled"
   - Delivery remains but order is cancelled

5. **Verify Deliveries Page**
   - Go to Deliveries page
   - Update Status dialog should NOT show "Cancelled"
   - Expected: Only Confirmed, In Transit, Received, Returned

## Files Modified

1. `/root/buy2rent/backend/orders/models.py` - Added 'cancelled' status
2. `/root/buy2rent/frontend/src/pages/Orders.tsx` - Added Cancel Order button
3. `/root/buy2rent/frontend/src/components/deliveries/DeliveryStatusUpdate.tsx` - Removed Cancelled option
4. `/root/buy2rent/frontend/src/pages/Deliveries.tsx` - Removed Cancelled references
5. `/root/buy2rent/frontend/src/pages/ApartmentView.tsx` - Updated delivery status display

## Deployment

✅ Backend updated with cancelled status  
✅ Frontend built and deployed  
✅ Services restarted  
✅ Live at: https://procurement.buy2rent.eu

---

**Status**: ✅ IMPLEMENTED AND DEPLOYED
**Date**: 2026-01-08
**Feature**: Cancel Order button in Orders page (Draft/Sent orders only)
