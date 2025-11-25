# Vendor API Visual Guide

## 🎯 The Truth: ONE API, Not Two!

```
┌─────────────────────────────────────────────────────────────────┐
│                    VendorViewSet (ONE CLASS)                    │
│                 File: backend/vendors/views.py                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📦 ModelViewSet (Django REST Framework)                        │
│  ├── GET    /api/vendors/              List all vendors        │
│  ├── POST   /api/vendors/              Create vendor           │
│  ├── GET    /api/vendors/{id}/         Get vendor              │
│  ├── PUT    /api/vendors/{id}/         Update vendor (full)    │
│  ├── PATCH  /api/vendors/{id}/         Update vendor (partial) │
│  └── DELETE /api/vendors/{id}/         Delete vendor           │
│                                                                 │
│  🎨 Custom Actions (@action decorator)                          │
│  ├── GET    /api/vendors/search_by_name/                       │
│  ├── GET    /api/vendors/frontend_detail_by_name/              │
│  ├── GET    /api/vendors/{id}/frontend_detail/                 │
│  ├── GET    /api/vendors/{id}/products/                        │
│  ├── GET    /api/vendors/{id}/orders/                          │
│  ├── GET    /api/vendors/{id}/issues/                          │
│  ├── GET    /api/vendors/{id}/payments/                        │
│  └── GET    /api/vendors/{id}/statistics/                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Why Swagger Shows "Two" Groups

```
Swagger UI Display:
┌──────────────────────────────────────────────────────────┐
│ 🏷️  Vendors (Tag from @add_viewset_tags)                 │
│ ├── Standard CRUD operations                            │
│ │   ├── POST   /api/vendors/                            │
│ │   ├── GET    /api/vendors/                            │
│ │   ├── PUT    /api/vendors/{id}/                       │
│ │   ├── PATCH  /api/vendors/{id}/                       │
│ │   ├── DELETE /api/vendors/{id}/                       │
│ │   └── GET    /api/vendors/{id}/                       │
│ │                                                        │
│ 🏷️  vendors (Lowercase from router registration)         │
│ └── Custom action endpoints                             │
│     ├── GET    /api/vendors/search_by_name/             │
│     ├── GET    /api/vendors/frontend_detail_by_name/    │
│     ├── GET    /api/vendors/{id}/frontend_detail/       │
│     ├── GET    /api/vendors/{id}/products/              │
│     ├── GET    /api/vendors/{id}/orders/                │
│     ├── GET    /api/vendors/{id}/issues/                │
│     ├── GET    /api/vendors/{id}/payments/              │
│     └── GET    /api/vendors/{id}/statistics/            │
└──────────────────────────────────────────────────────────┘
                        ↓
              Same VendorViewSet!
```

## 🔄 Data Flow Diagram

```
Frontend Request
       ↓
┌─────────────────────────────────────────┐
│  Frontend Hook (useVendors, useVendor)  │
│  File: hooks/useApi.ts                  │
└─────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────┐
│  API Service (vendorApi)                │
│  File: services/api.ts                  │
│  • vendorApi.getAll()                   │
│  • vendorApi.getById()                  │
│  • vendorApi.create()                   │
│  • vendorApi.update()                   │
│  • vendorApi.delete()                   │
└─────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────┐
│  HTTP Request                           │
│  GET /api/vendors/                      │
│  or                                     │
│  GET /api/vendors/{id}/                 │
└─────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────┐
│  Django URL Router                      │
│  File: config/urls.py                   │
│  router.register('vendors', VendorViewSet) │
└─────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────┐
│  VendorViewSet                          │
│  File: vendors/views.py                 │
│  • Handles CRUD operations              │
│  • Handles custom actions               │
└─────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────┐
│  Serializer                             │
│  • VendorSerializer (basic)             │
│  • VendorDetailSerializer (detailed)    │
│  • VendorViewDetailSerializer (frontend)│
└─────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────┐
│  Database                               │
│  vendors_vendor table                   │
└─────────────────────────────────────────┘
       ↓
Response sent back to Frontend
```

## 🎭 Use Case Scenarios

### Scenario 1: Show Vendors in Dropdown
```
Component: ProductForm.tsx
           ↓
Hook: useVendors()
           ↓
API: GET /api/vendors/
           ↓
Returns: List of vendors
```

### Scenario 2: Show Vendor Details in Modal
```
Component: VendorDetailsModalAPI.tsx
           ↓
Hook: useVendor(vendorId)
           ↓
API: GET /api/vendors/{id}/
           ↓
Returns: Full vendor details
```

### Scenario 3: Show Vendor Profile Page
```
Component: VendorView.tsx
           ↓
Direct fetch: /api/vendors/{id}/frontend_detail/
           ↓
Returns: Vendor + Products + Orders + Issues + Payments
```

### Scenario 4: Show Vendor Analytics Dashboard
```
Component: VendorDashboard.tsx
           ↓
Direct fetch: /api/vendors/{id}/statistics/
           ↓
Returns: Comprehensive statistics
```

## 🏗️ Backend Architecture

```
backend/
└── vendors/
    ├── models.py                           # 1 Vendor model
    │   └── class Vendor(models.Model)
    │
    ├── serializers.py                      # 3 serializers
    │   ├── VendorSerializer                # For list/create
    │   ├── VendorDetailSerializer          # For retrieve
    │   └── VendorListSerializer            # For simplified lists
    │
    ├── vendor_view_serializers.py          # 1 frontend serializer
    │   └── VendorViewDetailSerializer      # For frontend pages
    │
    └── views.py                            # 1 ViewSet (all endpoints!)
        └── class VendorViewSet
            ├── list()              [auto-generated]
            ├── create()            [auto-generated]
            ├── retrieve()          [auto-generated]
            ├── update()            [auto-generated]
            ├── partial_update()    [auto-generated]
            ├── destroy()           [auto-generated]
            ├── products()          [custom action]
            ├── orders()            [custom action]
            ├── issues()            [custom action]
            ├── payments()          [custom action]
            ├── statistics()        [custom action]
            ├── search_by_name()    [custom action]
            ├── frontend_detail()   [custom action]
            └── frontend_detail_by_name() [custom action]
```

## 📱 Frontend Architecture

```
frontend/src/
├── services/api.ts
│   └── class VendorApiService
│       ├── getAll()      → GET /api/vendors/
│       ├── getById()     → GET /api/vendors/{id}/
│       ├── create()      → POST /api/vendors/
│       ├── update()      → PATCH /api/vendors/{id}/
│       └── delete()      → DELETE /api/vendors/{id}/
│
├── hooks/useApi.ts
│   ├── useVendors()      → calls vendorApi.getAll()
│   └── useVendor(id)     → calls vendorApi.getById(id)
│
└── components/
    ├── modals/
    │   └── VendorDetailsModalAPI.tsx
    │       └── uses useVendor(id)
    │
    └── pages/
        └── VendorView.tsx
            └── fetches /api/vendors/{id}/frontend_detail/
```

## 🎯 Quick Reference

| Task | Endpoint | Hook/Method |
|------|----------|-------------|
| List vendors | `GET /api/vendors/` | `useVendors()` |
| Show vendor details | `GET /api/vendors/{id}/` | `useVendor(id)` |
| Create vendor | `POST /api/vendors/` | `vendorApi.create()` |
| Update vendor | `PATCH /api/vendors/{id}/` | `vendorApi.update()` |
| Delete vendor | `DELETE /api/vendors/{id}/` | `vendorApi.delete()` |
| Vendor profile page | `GET /api/vendors/{id}/frontend_detail/` | Direct fetch |
| Vendor analytics | `GET /api/vendors/{id}/statistics/` | Direct fetch |
| Vendor products | `GET /api/vendors/{id}/products/` | Direct fetch |
| Search by name | `GET /api/vendors/search_by_name/?name=X` | Direct fetch |

## ✅ Conclusion

```
┌─────────────────────────────────────────────┐
│                                             │
│  ❌ NOT THIS:                               │
│  Two separate vendor APIs                  │
│                                             │
│  ✅ ACTUALLY THIS:                          │
│  One VendorViewSet with:                   │
│  • Standard CRUD operations                │
│  • Custom action endpoints                 │
│  • Both shown in Swagger                   │
│                                             │
│  🎉 No merging needed!                      │
│  🎉 No changes needed!                      │
│  🎉 Everything is correct!                  │
│                                             │
└─────────────────────────────────────────────┘
```

## 📚 Documentation Files

1. **VENDOR_API_DOCUMENTATION.md** - Complete API reference
2. **API_CLARIFICATION.md** - Explanation of "two groups"
3. **VENDOR_API_VISUAL_GUIDE.md** - This visual guide

All three explain the same truth:
**You have ONE correct, well-designed vendor API!** 🎉
