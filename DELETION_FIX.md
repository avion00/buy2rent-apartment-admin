# Foreign Key Constraint Fix for Apartment Deletion

## Problem
When deleting apartments through Django admin, a `FOREIGN KEY constraint failed` error occurred due to SQLite's strict foreign key enforcement during transactions.

## Root Cause
SQLite enforces foreign key constraints even during CASCADE deletions within transactions. The apartment has multiple related models:
- Products (which have Issues)
- Orders
- Payments
- Deliveries
- Activities
- AI Notes

## Solution
Implemented a robust deletion strategy that temporarily disables foreign key constraints for SQLite during the deletion process.

### Files Modified

1. **`backend/apartments/admin.py`**
   - Added `delete_queryset()` method for bulk deletions
   - Added `delete_model()` method for single deletions
   - Temporarily disables FK constraints with `PRAGMA foreign_keys = OFF`
   - Deletes all related objects explicitly
   - Re-enables FK constraints after deletion

2. **`backend/apartments/views.py`**
   - Added `perform_destroy()` method in `ApartmentViewSet`
   - Same FK constraint handling for API deletions
   - Wrapped in transaction for atomicity

3. **`backend/config/settings.py`**
   - Added SQLite-specific configuration to enable foreign key constraints by default

## How It Works
```python
1. Detect if database is SQLite
2. Execute: PRAGMA foreign_keys = OFF;
3. Delete all related objects in transaction:
   - Issues
   - Products
   - Orders
   - Payments
   - Deliveries
   - Activities
   - AI Notes
   - Apartment
4. Execute: PRAGMA foreign_keys = ON;
```

## Testing
Try deleting the apartment "Iasdfasdfe" again through:
- ✅ Django Admin interface (`/admin/apartments/apartment/`)
- ✅ Frontend application (uses REST API with new confirmation dialog)

Both should now work without foreign key constraint errors.

## Note
This solution is SQLite-specific. For PostgreSQL or MySQL in production, the CASCADE deletions should work natively without needing to disable constraints.
