# VendorView API Setup Guide

## Overview
This guide provides complete setup instructions for integrating the backend APIs with the VendorView.tsx frontend page. The backend has been enhanced with comprehensive vendor-related endpoints and data structures.

## 🚀 Backend Setup

### 1. Add Orders App to Settings
Add the orders app to your Django settings:

```python
# backend/config/settings.py
INSTALLED_APPS = [
    # ... existing apps
    'orders',  # Add this line
    # ... rest of apps
]
```

### 2. Run Migrations
Create and apply migrations for the new models:

```bash
cd backend
python manage.py makemigrations orders
python manage.py makemigrations vendors  # Update existing vendor models
python manage.py migrate
```

### 3. Create Sample Data (Optional)
Create some sample vendors, orders, products, issues, and payments for testing:

```bash
python manage.py shell
```

```python
# Create sample data
from vendors.models import Vendor
from apartments.models import Apartment
from orders.models import Order
from products.models import Product
from issues.models import Issue
from payments.models import Payment

# Create sample vendor
vendor = Vendor.objects.create(
    name="IKEA Hungary",
    email="contact@ikea.hu",
    website="https://www.ikea.com/hu/",
    logo="🏠",
    lead_time="7-14 days",
    reliability=4.2,
    orders_count=15,
    active_issues=2
)

# Create more sample data as needed...
```

## 🎯 Frontend Integration

### 1. Update VendorView.tsx
Replace the current VendorView.tsx with API integration:

```typescript
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVendorDetailByName, useVendorStatistics } from '@/hooks/useVendorApi';
// ... other imports

const VendorView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Use the new API hooks
  const { data: vendor, isLoading, error } = useVendorDetailByName(id || '');
  const { data: statistics } = useVendorStatistics(vendor?.id || '');

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error || !vendor) {
    return <div>Vendor not found</div>;
  }

  // Use vendor data directly from API
  const vendorProducts = vendor.products || [];
  const vendorOrders = vendor.orders || [];
  const vendorIssues = vendor.issues || [];
  const vendorPayments = vendor.payments || [];

  // ... rest of component
};
```

### 2. Available API Endpoints

#### Core Vendor Endpoints
- `GET /api/vendors/` - List all vendors
- `GET /api/vendors/{id}/` - Get vendor details
- `GET /api/vendors/{id}/frontend_detail/` - Get vendor with all related data (optimized for VendorView)
- `GET /api/vendors/frontend_detail_by_name/?name={name}` - Get vendor by name (for URL routing)

#### Vendor-Related Data Endpoints
- `GET /api/vendors/{id}/products/` - Get all products for vendor
- `GET /api/vendors/{id}/orders/` - Get all orders for vendor
- `GET /api/vendors/{id}/issues/` - Get all issues for vendor
- `GET /api/vendors/{id}/payments/` - Get all payments for vendor
- `GET /api/vendors/{id}/statistics/` - Get comprehensive vendor statistics

#### Individual Resource Endpoints
- `GET /api/products/` - List products (filterable by vendor)
- `GET /api/orders/` - List orders (filterable by vendor)
- `GET /api/issues/` - List issues (filterable by vendor)
- `GET /api/payments/` - List payments (filterable by vendor)

### 3. API Response Formats

#### Vendor Detail Response
```json
{
  "id": "uuid",
  "name": "IKEA Hungary",
  "logo": "🏠",
  "contact": "contact@ikea.hu",
  "website": "https://www.ikea.com/hu/",
  "lead_time": "7-14 days",
  "reliability": 4.2,
  "orders_count": 15,
  "active_issues": 2,
  "products": [
    {
      "id": "uuid",
      "product": "Office Chair",
      "apartment": "Apartment 101",
      "price": 299.99,
      "qty": 2,
      "availability": "in_stock",
      "status": "delivered"
    }
  ],
  "orders": [
    {
      "id": "uuid",
      "po_number": "ORD-001",
      "apartment": "Apartment 101",
      "items_count": 3,
      "total": 2450.00,
      "status": "delivered",
      "placed_on": "2024-11-10"
    }
  ],
  "issues": [
    {
      "id": "uuid",
      "item": "Office Chair",
      "issue_type": "delivery",
      "description": "Product delivery delayed",
      "priority": "medium",
      "status": "open",
      "created_date": "2024-11-12"
    }
  ],
  "payments": [
    {
      "id": "uuid",
      "order_no": "ORD-001",
      "apartment": "Apartment 101",
      "amount": 2450.00,
      "status": "paid",
      "due_date": "2024-11-15",
      "paid_date": "2024-11-10"
    }
  ],
  "products_count": 25,
  "orders_total_value": 15000.00
}
```

#### Statistics Response
```json
{
  "vendor_info": {
    "id": "uuid",
    "name": "IKEA Hungary",
    "reliability": 4.2,
    "orders_count": 15,
    "active_issues": 2
  },
  "products": {
    "total": 25,
    "delivered": 20,
    "with_issues": 3
  },
  "orders": {
    "total": 15,
    "delivered": 12,
    "total_value": 15000.00
  },
  "payments": {
    "total": 15,
    "paid": 10,
    "total_amount": 15000.00,
    "outstanding_amount": 5000.00
  },
  "issues": {
    "total": 5,
    "open": 2
  },
  "performance": {
    "on_time_delivery_rate": 95.0,
    "quality_rating": 4.5,
    "order_accuracy": 98.0
  }
}
```

## 🔧 API Hooks Usage

### Basic Usage
```typescript
import { 
  useVendorDetailByName, 
  useVendorStatistics,
  useVendorProducts,
  useVendorOrders,
  useVendorIssues,
  useVendorPayments 
} from '@/hooks/useVendorApi';

// Get vendor by name (for URL routing)
const { data: vendor, isLoading, error } = useVendorDetailByName('ikea-hungary');

// Get vendor statistics
const { data: stats } = useVendorStatistics(vendor?.id);

// Get individual data sets
const { data: products } = useVendorProducts(vendor?.id);
const { data: orders } = useVendorOrders(vendor?.id);
const { data: issues } = useVendorIssues(vendor?.id);
const { data: payments } = useVendorPayments(vendor?.id);
```

### Error Handling
```typescript
const { data: vendor, isLoading, error } = useVendorDetailByName(vendorName);

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!vendor) return <NotFound />;
```

## 🎨 Frontend Features Supported

### ✅ Implemented Features
- **Vendor Details**: Complete vendor information with contact details
- **Statistics Cards**: Orders, issues, products, reliability metrics
- **Performance Metrics**: On-time delivery, quality rating, order accuracy
- **Tabbed Interface**: Overview, Products, Orders, Issues, Payments
- **Data Tables**: Sortable and filterable tables for all data types
- **Real-time Data**: API-driven data with proper caching
- **Error Handling**: Comprehensive error states and loading indicators
- **URL Routing**: Support for vendor name-based URLs

### 🚀 Ready for Enhancement
- **Search & Filtering**: Backend supports advanced filtering
- **Pagination**: Built-in pagination support for large datasets
- **Real-time Updates**: WebSocket support can be added
- **Export Features**: Data export functionality ready
- **Bulk Operations**: Multi-select and bulk actions support

## 🔍 Testing the Integration

### 1. Test API Endpoints
```bash
# Test vendor detail endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/vendors/frontend_detail_by_name/?name=ikea-hungary

# Test statistics endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/vendors/{vendor-id}/statistics/
```

### 2. Frontend Testing
1. Navigate to `/vendors/ikea-hungary` (or any vendor name)
2. Check that all tabs load properly
3. Verify data displays correctly in tables
4. Test error states with invalid vendor names
5. Check loading states

## 🐛 Troubleshooting

### Common Issues

1. **"Vendor not found" error**
   - Ensure vendor names in URLs match database names (case-insensitive)
   - Check that vendors exist in the database

2. **API authentication errors**
   - Verify JWT token is properly stored and sent
   - Check token expiration

3. **Empty data in tabs**
   - Verify related data exists (products, orders, etc.)
   - Check foreign key relationships

4. **Performance issues**
   - API responses are optimized with select_related and prefetch_related
   - Implement pagination for large datasets

### Debug Mode
Enable debug logging in the API hooks:
```typescript
const { data, isLoading, error } = useVendorDetailByName(vendorName);
console.log('Vendor data:', data);
console.log('Loading:', isLoading);
console.log('Error:', error);
```

## 📈 Performance Optimizations

### Backend Optimizations
- **Database Queries**: Optimized with select_related and prefetch_related
- **Response Caching**: 5-minute cache for vendor details
- **Pagination**: Built-in pagination for large datasets
- **Indexing**: Database indexes on frequently queried fields

### Frontend Optimizations
- **React Query Caching**: Intelligent caching with stale-while-revalidate
- **Code Splitting**: Lazy loading for heavy components
- **Memoization**: Proper use of useMemo and useCallback
- **Error Boundaries**: Graceful error handling

This setup provides a robust, scalable foundation for the VendorView page with comprehensive API integration.
