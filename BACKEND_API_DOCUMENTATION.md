# Complete Backend API Documentation

## Overview
This Django REST Framework backend provides comprehensive APIs for managing apartments, products, vendors, clients, and related entities. The backend is built with Django 5.2 and uses PostgreSQL/SQLite as the database.

## Base Configuration
- **Base URL**: `http://localhost:8000`
- **API Root**: `/api/`
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: 
  - Swagger UI: `/api/docs/`
  - ReDoc: `/api/redoc/`
  - Schema: `/api/schema/`

## Authentication Endpoints

### Base Path: `/auth/`

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/auth/login/` | User login | `{username, password}` | `{access, refresh, user}` |
| POST | `/auth/refresh/` | Refresh access token | `{refresh}` | `{access}` |
| POST | `/auth/register/` | User registration | `{username, email, password, first_name, last_name}` | User object |
| POST | `/auth/logout/` | User logout | `{refresh}` | Success message |
| GET | `/auth/check/` | Check auth status | - | Auth status |
| GET | `/auth/profile/` | Get user profile | - | User profile |
| PATCH | `/auth/profile/` | Update user profile | User fields | Updated profile |
| POST | `/auth/change-password/` | Change password | `{old_password, new_password}` | Success message |
| POST | `/auth/password-reset/` | Request password reset | `{email}` | Success message |
| POST | `/auth/password-reset-confirm/` | Confirm password reset | `{token, password}` | Success message |
| GET | `/auth/sessions/` | Get user sessions | - | Session list |
| DELETE | `/auth/sessions/{id}/` | Terminate session | - | Success message |

## Main API Endpoints

### 1. Clients API
**Base Path**: `/api/clients/`

| Method | Endpoint | Description | Query Parameters | Request Body |
|--------|----------|-------------|------------------|--------------|
| GET | `/` | List all clients | `search`, `account_status`, `type`, `ordering`, `page` | - |
| POST | `/` | Create client | - | Client data |
| GET | `/{id}/` | Get client details (with apartments & products) | - | - |
| PATCH | `/{id}/` | Update client | - | Partial client data |
| PUT | `/{id}/` | Replace client | - | Complete client data |
| DELETE | `/{id}/` | Delete client | - | - |
| GET | `/{id}/apartments/` | Get client apartments | - | - |
| GET | `/{id}/products/` | Get client products | - | - |
| GET | `/{id}/statistics/` | Get client statistics | - | - |
| GET | `/{id}/details/` | Get complete client profile | - | - |

**Client Model Fields**:
- `id` (UUID)
- `name` (string, required)
- `email` (string)
- `phone` (string)
- `address` (text)
- `account_status` (choice: Active/Inactive/Suspended)
- `type` (choice: Individual/Company)
- `notes` (text)
- `created_at` (datetime)
- `updated_at` (datetime)

### 2. Apartments API
**Base Path**: `/api/apartments/`

| Method | Endpoint | Description | Query Parameters | Request Body |
|--------|----------|-------------|------------------|--------------|
| GET | `/` | List all apartments | `search`, `type`, `status`, `client`, `ordering` | - |
| POST | `/` | Create apartment | - | Apartment data |
| GET | `/{id}/` | Get apartment details | - | - |
| PATCH | `/{id}/` | Update apartment | - | Partial apartment data |
| PUT | `/{id}/` | Replace apartment | - | Complete apartment data |
| DELETE | `/{id}/` | Delete apartment | - | - |

**Apartment Model Fields**:
- `id` (UUID)
- `name` (string, required)
- `type` (choice: furnishing/renovation/construction)
- `status` (choice: Planning/In Progress/Completed/On Hold)
- `client` (FK to Client)
- `address` (text)
- `start_date` (date)
- `due_date` (date)
- `designer` (string)
- `created_at` (datetime)
- `updated_at` (datetime)

### 3. Vendors API
**Base Path**: `/api/vendors/`

| Method | Endpoint | Description | Query Parameters | Request Body |
|--------|----------|-------------|------------------|--------------|
| GET | `/` | List all vendors | `search`, `ordering` | - |
| POST | `/` | Create vendor | - | Vendor data |
| GET | `/{id}/` | Get vendor details | - | - |
| PATCH | `/{id}/` | Update vendor | - | Partial vendor data |
| PUT | `/{id}/` | Replace vendor | - | Complete vendor data |
| DELETE | `/{id}/` | Delete vendor | - | - |
| GET | `/{id}/products/` | Get vendor products | - | - |
| GET | `/{id}/orders/` | Get vendor orders | - | - |
| GET | `/{id}/issues/` | Get vendor issues | - | - |
| GET | `/{id}/payments/` | Get vendor payments | - | - |
| GET | `/{id}/statistics/` | Get vendor statistics | - | - |
| GET | `/{id}/view/` | Get vendor view details | - | - |

**Vendor Model Fields**:
- `id` (UUID)
- `name` (string, required)
- `company_name` (string)
- `contact_person` (string)
- `email` (string)
- `phone` (string)
- `website` (URL)
- `logo` (string/emoji)
- `lead_time` (string)
- `reliability` (decimal 0-5)
- `orders_count` (integer)
- `active_issues` (integer)
- `address`, `city`, `country`, `postal_code`
- `tax_id`, `business_type`, `year_established`
- `employee_count`, `category`, `product_categories`
- `certifications`, `specializations`
- `payment_terms`, `delivery_terms`
- `warranty_period`, `return_policy`
- `minimum_order` (decimal)
- `notes` (text)

### 4. Products API
**Base Path**: `/api/products/`

| Method | Endpoint | Description | Query Parameters | Request Body |
|--------|----------|-------------|------------------|--------------|
| GET | `/` | List all products | `apartment`, `vendor`, `availability`, `status`, `search`, `ordering` | - |
| POST | `/` | Create product | - | Product data |
| GET | `/{id}/` | Get product details | - | - |
| PATCH | `/{id}/` | Update product | - | Partial product data |
| PUT | `/{id}/` | Replace product | - | Complete product data |
| DELETE | `/{id}/` | Delete product | - | - |
| GET | `/by_apartment/` | Get products by apartment | `apartment_id` | - |
| PATCH | `/{id}/update_status/` | Update product status | - | `{status, status_tags}` |
| PATCH | `/{id}/update_delivery_status/` | Update delivery status | - | `{delivery_status_tags}` |
| GET | `/statistics/` | Get product statistics | `apartment_id` | - |
| POST | `/import_excel/` | Import products from Excel | - | `{file, apartment_id}` |
| POST | `/create_apartment_and_import/` | Create apartment & import | - | `{file, apartment_name, ...}` |
| GET | `/import_template/` | Download import template | - | - |
| GET | `/categories/` | Get product categories | `apartment_id` | - |
| GET | `/by_category/` | Get products by category | `category_id` | - |
| GET | `/import_sessions/` | Get import sessions | `apartment_id` | - |
| DELETE | `/delete_import_session/` | Delete import session | `session_id` | - |

**Product Model Fields**:
- `id` (UUID)
- `apartment` (FK to Apartment)
- `vendor` (FK to Vendor)
- `product` (string - product name)
- `sku` (string)
- `brand` (string)
- `category` (string)
- `room` (string)
- `quantity` (integer)
- `unit_price` (decimal)
- `total_amount` (decimal)
- `description` (text)
- `link` (URL)
- `size` (string)
- `image` (image file)
- `image_url` (URL)
- `availability` (choice: In Stock/Out of Stock/Pre-order)
- `status` (choice: Pending/Ordered/Shipped/Delivered/Cancelled)
- `payment_status` (choice: Unpaid/Partially Paid/Paid/Refunded)
- `issue_state` (choice: No Issue/Issue Reported/Issue Resolved)
- `expected_delivery_date` (date)
- `actual_delivery_date` (date)
- `payment_due_date` (date)
- `payment_amount` (decimal)
- `paid_amount` (decimal)
- `replacement_requested` (boolean)
- `replacement_approved` (boolean)
- Additional Excel import fields: `nm`, `plusz_nm`, `price_per_nm`, etc.

### 5. Orders API
**Base Path**: `/api/orders/`

| Method | Endpoint | Description | Query Parameters | Request Body |
|--------|----------|-------------|------------------|--------------|
| GET | `/` | List all orders | `apartment`, `vendor`, `status`, `search` | - |
| POST | `/` | Create order | - | Order data |
| GET | `/{id}/` | Get order details | - | - |
| PATCH | `/{id}/` | Update order | - | Partial order data |
| DELETE | `/{id}/` | Delete order | - | - |
| POST | `/{id}/add_item/` | Add item to order | - | Item data |
| DELETE | `/{id}/remove_item/` | Remove item from order | `item_id` | - |
| PATCH | `/{id}/update_status/` | Update order status | - | `{status}` |

**Order Model Fields**:
- `id` (UUID)
- `apartment` (FK to Apartment)
- `vendor` (FK to Vendor)
- `order_number` (string)
- `status` (choice: pending/confirmed/shipped/delivered/cancelled)
- `total` (decimal)
- `notes` (text)
- `created_at` (datetime)
- `updated_at` (datetime)

### 6. Order Items API
**Base Path**: `/api/order-items/`

| Method | Endpoint | Description | Query Parameters | Request Body |
|--------|----------|-------------|------------------|--------------|
| GET | `/` | List all order items | `order` | - |
| POST | `/` | Create order item | - | Order item data |
| GET | `/{id}/` | Get order item | - | - |
| PATCH | `/{id}/` | Update order item | - | Partial item data |
| DELETE | `/{id}/` | Delete order item | - | - |

### 7. Deliveries API
**Base Path**: `/api/deliveries/`

| Method | Endpoint | Description | Query Parameters | Request Body |
|--------|----------|-------------|------------------|--------------|
| GET | `/` | List all deliveries | `apartment`, `vendor`, `status`, `search` | - |
| POST | `/` | Create delivery | - | Delivery data |
| GET | `/{id}/` | Get delivery details | - | - |
| PATCH | `/{id}/` | Update delivery | - | Partial delivery data |
| DELETE | `/{id}/` | Delete delivery | - | - |

**Delivery Model Fields**:
- `id` (UUID)
- `apartment` (FK to Apartment)
- `vendor` (FK to Vendor)
- `tracking_number` (string)
- `status` (choice: pending/in_transit/delivered/failed)
- `expected_date` (date)
- `actual_date` (date)
- `notes` (text)

### 8. Payments API
**Base Path**: `/api/payments/`

| Method | Endpoint | Description | Query Parameters | Request Body |
|--------|----------|-------------|------------------|--------------|
| GET | `/` | List all payments | `apartment`, `vendor`, `status`, `search` | - |
| POST | `/` | Create payment | - | Payment data |
| GET | `/{id}/` | Get payment details | - | - |
| PATCH | `/{id}/` | Update payment | - | Partial payment data |
| DELETE | `/{id}/` | Delete payment | - | - |

**Payment Model Fields**:
- `id` (UUID)
- `apartment` (FK to Apartment)
- `vendor` (FK to Vendor)
- `invoice_number` (string)
- `total_amount` (decimal)
- `amount_paid` (decimal)
- `status` (choice: Unpaid/Partially Paid/Paid/Overdue)
- `due_date` (date)
- `payment_date` (date)
- `payment_method` (string)
- `notes` (text)

### 9. Payment History API
**Base Path**: `/api/payment-history/`

| Method | Endpoint | Description | Query Parameters | Request Body |
|--------|----------|-------------|------------------|--------------|
| GET | `/` | List payment history | `payment` | - |
| POST | `/` | Create payment record | - | Payment history data |
| GET | `/{id}/` | Get payment record | - | - |

### 10. Issues API
**Base Path**: `/api/issues/`

| Method | Endpoint | Description | Query Parameters | Request Body |
|--------|----------|-------------|------------------|--------------|
| GET | `/` | List all issues | `apartment`, `product`, `vendor`, `status`, `priority` | - |
| POST | `/` | Create issue | - | Issue data |
| GET | `/{id}/` | Get issue details | - | - |
| PATCH | `/{id}/` | Update issue | - | Partial issue data |
| DELETE | `/{id}/` | Delete issue | - | - |

**Issue Model Fields**:
- `id` (UUID)
- `apartment` (FK to Apartment)
- `product` (FK to Product)
- `vendor` (FK to Vendor)
- `title` (string)
- `description` (text)
- `status` (choice: Open/In Progress/Resolved/Closed)
- `priority` (choice: Low/Medium/High/Critical)
- `reported_date` (datetime)
- `resolved_date` (datetime)

### 11. Issue Photos API
**Base Path**: `/api/issue-photos/`

| Method | Endpoint | Description | Query Parameters | Request Body |
|--------|----------|-------------|------------------|--------------|
| GET | `/` | List issue photos | `issue` | - |
| POST | `/` | Upload issue photo | - | `{issue, photo, description}` |
| DELETE | `/{id}/` | Delete issue photo | - | - |

### 12. AI Communication Logs API
**Base Path**: `/api/ai-communication-logs/`

| Method | Endpoint | Description | Query Parameters | Request Body |
|--------|----------|-------------|------------------|--------------|
| GET | `/` | List AI communications | `issue` | - |
| POST | `/` | Create AI log | - | Log data |
| GET | `/{id}/` | Get AI log | - | - |

### 13. Activities API
**Base Path**: `/api/activities/`

| Method | Endpoint | Description | Query Parameters | Request Body |
|--------|----------|-------------|------------------|--------------|
| GET | `/` | List activities | `apartment`, `search` | - |
| POST | `/` | Create activity | - | Activity data |
| GET | `/{id}/` | Get activity | - | - |
| PATCH | `/{id}/` | Update activity | - | Partial activity data |
| DELETE | `/{id}/` | Delete activity | - | - |

**Activity Model Fields**:
- `id` (UUID)
- `apartment` (FK to Apartment)
- `title` (string)
- `description` (text)
- `type` (choice: Meeting/Call/Email/Site Visit/Other)
- `date` (datetime)
- `participants` (text)
- `notes` (text)

### 14. AI Notes API
**Base Path**: `/api/ai-notes/`

| Method | Endpoint | Description | Query Parameters | Request Body |
|--------|----------|-------------|------------------|--------------|
| GET | `/` | List AI notes | `apartment` | - |
| POST | `/` | Create AI note | - | Note data |
| GET | `/{id}/` | Get AI note | - | - |
| PATCH | `/{id}/` | Update AI note | - | Partial note data |
| DELETE | `/{id}/` | Delete AI note | - | - |

### 15. Manual Notes API
**Base Path**: `/api/manual-notes/`

| Method | Endpoint | Description | Query Parameters | Request Body |
|--------|----------|-------------|------------------|--------------|
| GET | `/` | List manual notes | `apartment` | - |
| POST | `/` | Create manual note | - | Note data |
| GET | `/{id}/` | Get manual note | - | - |
| PATCH | `/{id}/` | Update manual note | - | Partial note data |
| DELETE | `/{id}/` | Delete manual note | - | - |

## Common Features

### Pagination
All list endpoints support pagination:
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20)

Response format:
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/endpoint/?page=2",
  "previous": null,
  "results": [...]
}
```

### Filtering
Most endpoints support filtering via query parameters:
- Exact match: `?field=value`
- Search: `?search=term` (searches in specified fields)
- Date range: `?date_after=2024-01-01&date_before=2024-12-31`

### Ordering
Use `?ordering=field` for ascending or `?ordering=-field` for descending order.
Multiple fields: `?ordering=field1,-field2`

### Error Responses
Standard error format:
```json
{
  "error": "Error message",
  "details": {
    "field": ["Error detail"]
  }
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 204: No Content (successful delete)
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Authentication Headers
All API requests (except login/register) require authentication:
```
Authorization: Bearer <access_token>
```

## File Upload
For endpoints that accept files (like product import):
- Use `multipart/form-data` content type
- File field name: `file`
- Additional data as form fields

## CORS Configuration
The backend is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative frontend)

## Media Files
- Uploaded images are served at: `/media/`
- Product images: `/media/products/`
- Issue photos: `/media/issues/`

## Testing
API testing tools available:
- Swagger UI: Interactive API documentation at `/api/docs/`
- ReDoc: Alternative API documentation at `/api/redoc/`
- Django Admin: `/admin/` (requires superuser account)

## Database Models
The backend uses UUID primary keys for all models, ensuring:
- Globally unique identifiers
- Better security (no sequential IDs)
- Easier data migration and synchronization

## Performance Features
- Select related and prefetch related optimizations
- Database indexing on frequently queried fields
- Caching for static data
- Pagination to limit response size

## Security Features
- JWT authentication with refresh tokens
- CSRF protection
- SQL injection prevention via ORM
- Input validation and sanitization
- Secure password hashing (PBKDF2)
- Rate limiting on authentication endpoints
