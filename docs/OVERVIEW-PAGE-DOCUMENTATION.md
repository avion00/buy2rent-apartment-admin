# 📊 Overview Page - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [Page Structure](#page-structure)
3. [Data Flow & Architecture](#data-flow--architecture)
4. [Components Breakdown](#components-breakdown)
5. [API Integration](#api-integration)
6. [User Workflows](#user-workflows)
7. [Technical Implementation](#technical-implementation)
8. [Performance & Optimization](#performance--optimization)

---

## Overview

The **Overview Page** (`/root/buy2rent/frontend/src/pages/Overview.tsx`) is the main dashboard landing page that provides a comprehensive, real-time view of the entire Buy2Rent apartment procurement system. It serves as the central hub for monitoring key performance indicators (KPIs), tracking activities, and getting quick insights into the business operations.

### Purpose
- **Real-time monitoring** of critical business metrics
- **Visual analytics** through interactive charts
- **Activity tracking** for all system operations
- **Quick access** to recent orders, payments, and issues
- **Performance trends** over time

### Key Features
- ✅ 5 KPI cards with trend indicators
- 📊 Interactive charts (Orders vs Deliveries, Spending Trend)
- 📝 Recent orders and payments lists
- 🔄 Live activity feed with real-time updates
- ⚡ Auto-refresh every 5 minutes
- 💾 Smart caching with React Query

---

## Page Structure

### Layout Hierarchy

```
Overview Page
├── Page Header (from PageLayout)
│   └── Title: "Dashboard Overview"
│
├── KPI Cards Row (5 cards)
│   ├── Active Apartments
│   ├── Pending Orders
│   ├── Open Issues
│   ├── Deliveries This Week
│   └── Overdue Payments
│
├── Charts Row (2 charts)
│   ├── Orders Placed vs Delivered (Bar Chart)
│   └── Total Spending Trend (Line Chart)
│
├── Recent Data Row (2 cards)
│   ├── Recent Orders (Last 5)
│   └── Recent Payments (Last 5)
│
└── Activity Feed
    └── Recent Activities (Last 15)
```

### Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│                    Dashboard Overview                        │
├─────────────────────────────────────────────────────────────┤
│  [KPI 1]  [KPI 2]  [KPI 3]  [KPI 4]  [KPI 5]              │
├──────────────────────────────┬──────────────────────────────┤
│                              │                              │
│   Orders Placed vs Delivered │   Total Spending Trend       │
│   (Bar Chart)                │   (Line Chart)               │
│                              │                              │
├──────────────────────────────┼──────────────────────────────┤
│                              │                              │
│   Recent Orders              │   Recent Payments            │
│   • Order 1                  │   • Payment 1                │
│   • Order 2                  │   • Payment 2                │
│   • Order 3                  │   • Payment 3                │
│                              │                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Recent Activity Feed                                      │
│   • Activity 1                                              │
│   • Activity 2                                              │
│   • Activity 3                                              │
│   ...                                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow & Architecture

### Frontend → Backend Flow

```
┌──────────────────┐
│  Overview.tsx    │
│  (React Page)    │
└────────┬─────────┘
         │
         │ Uses hooks
         ▼
┌──────────────────────────────┐
│  useDashboardOverview()      │
│  useDashboardRecentActivities() │
│  (React Query Hooks)         │
└────────┬─────────────────────┘
         │
         │ Calls API
         ▼
┌──────────────────────────────┐
│  dashboardApi.ts             │
│  (Axios Service)             │
└────────┬─────────────────────┘
         │
         │ HTTP GET
         ▼
┌──────────────────────────────┐
│  Backend API Endpoints       │
│  /api/dashboard/overview/    │
│  /api/dashboard/recent-activities/ │
└────────┬─────────────────────┘
         │
         │ Queries Database
         ▼
┌──────────────────────────────┐
│  Django Views                │
│  - DashboardOverviewView     │
│  - DashboardRecentActivitiesView │
└────────┬─────────────────────┘
         │
         │ Aggregates data
         ▼
┌──────────────────────────────┐
│  Database Models             │
│  - Apartments                │
│  - Orders                    │
│  - Deliveries                │
│  - Payments                  │
│  - Issues                    │
│  - Activities                │
└──────────────────────────────┘
```

### Data Refresh Strategy

```
Initial Load → API Call → Cache (1 min) → Auto-refresh (5 min)
                  ↓
            React Query
                  ↓
         Stale Time: 60s
         Refetch: 5 min
```

---

## Components Breakdown

### 1. KPI Cards (5 Cards)

**Component:** `KPICard.tsx`

#### Active Apartments
- **Value:** Total count of apartments in system
- **Trend:** Percentage change vs last month
- **Icon:** Building2
- **Color:** Primary

#### Pending Orders
- **Value:** Orders with status: draft, confirmed, processing
- **Trend:** Percentage change vs last week
- **Icon:** Package
- **Color:** Primary

#### Open Issues
- **Value:** Issues with status: Open, Pending Vendor Response, Resolution Agreed
- **Trend:** No change indicator
- **Icon:** AlertCircle
- **Color:** Primary

#### Deliveries This Week
- **Value:** Deliveries scheduled/completed this week
- **Trend:** Percentage change vs last week
- **Icon:** Truck
- **Color:** Primary

#### Overdue Payments
- **Value:** Payments with status Unpaid/Partial and due_date < today
- **Trend:** Percentage change vs last month
- **Icon:** CreditCard
- **Color:** Primary

**KPI Card Structure:**
```typescript
interface KPICardProps {
  title: string;           // Display name
  value: string | number;  // Main metric
  icon: LucideIcon;        // Icon component
  trend?: {
    value: number;         // Percentage change
    label: string;         // "vs last month"
  };
}
```

**Trend Color Logic:**
- **Green** (text-success): trend.value > 0
- **Red** (text-danger): trend.value < 0
- **Gray** (text-muted-foreground): trend.value === 0

---

### 2. Orders Placed vs Delivered Chart

**Type:** Bar Chart (Recharts)

**Data Structure:**
```typescript
{
  month: string;      // "Jun", "Jul", "Aug", etc.
  ordered: number;    // Orders created this month
  delivered: number;  // Deliveries completed this month
}
```

**Time Range:** Last 6 months

**Visual Features:**
- **Ordered bars:** Primary color, rounded corners
- **Delivered bars:** Success color (green), rounded corners
- **Grid:** Dashed lines
- **Tooltip:** Shows exact values on hover
- **Legend:** Bottom, with color indicators
- **Responsive:** Adapts to screen size

**Data Source:**
- Backend calculates monthly aggregates
- Counts orders by `created_at` month
- Counts deliveries by `actual_date` month (status='Delivered')

---

### 3. Total Spending Trend Chart

**Type:** Line Chart (Recharts)

**Data Structure:**
```typescript
{
  month: string;   // "Jun", "Jul", "Aug", etc.
  amount: number;  // Total payments made (€)
}
```

**Time Range:** Last 6 months

**Visual Features:**
- **Line:** Primary color, 2px width
- **Dots:** Filled circles at data points
- **Smooth curve:** Monotone interpolation
- **Grid:** Dashed lines
- **Tooltip:** Shows amount in currency format
- **Responsive:** Adapts to screen size

**Data Source:**
- Backend sums `amount_paid` from Payment model
- Groups by month from `created_at`

---

### 4. Recent Orders Card

**Displays:** Last 5 orders

**Data Fields:**
- **PO Number:** Order reference (badge)
- **Status:** Order status (colored badge)
- **Apartment:** Associated apartment name
- **Vendor:** Vendor name
- **Total:** Order total in Ft (Hungarian Forint)

**Status Badge Colors:**
- **delivered:** Default (primary)
- **processing:** Secondary (gray)
- **Other:** Outline (border only)

**Interactions:**
- Hover effect: Background changes to muted
- Click: (Future) Navigate to order details

---

### 5. Recent Payments Card

**Displays:** Last 5 payments

**Data Fields:**
- **Order Reference:** PO number or reference
- **Status:** Payment status (colored badge)
- **Vendor:** Vendor name
- **Amount:** amount_paid / total_amount in Ft
- **Icon:** Credit card icon with primary background

**Status Badge Colors:**
- **Paid:** Default (green/primary)
- **Partial:** Secondary (yellow/warning)
- **Unpaid:** Destructive (red)

**Visual Layout:**
```
┌─────────────────────────────┐
│ [💳] PO-12345    [Paid]    │
│     Vendor Name             │
│     50,000 / 50,000 Ft      │
└─────────────────────────────┘
```

---

### 6. Activity Feed

**Component:** `ActivityFeed.tsx`

**Displays:** Last 15 activities across all system operations

**Activity Types:**
- **order:** Order created/updated/deleted
- **payment:** Payment received/updated
- **delivery:** Delivery scheduled/completed
- **issue:** Issue reported/resolved
- **product:** Product added/updated
- **apartment:** Apartment created/updated
- **client:** Client added/updated
- **vendor:** Vendor added/updated

**Activity Actions:**
- **created:** Green badge, Plus icon
- **updated:** Blue badge, Pencil icon
- **deleted:** Red badge, Trash icon
- **delivered:** Green badge, CheckCircle icon
- **payment_received:** Green badge, CheckCircle icon
- **status_changed:** Amber badge, ArrowRight icon

**Visual Features:**
- **Timeline connector:** Vertical line between activities
- **Icon badges:** Colored circles with action icons
- **Hover effects:** Shadow and scale animation
- **Timestamp:** "X minutes/hours/days ago"
- **Apartment tag:** Shows related apartment if applicable
- **Scrollable:** Max height 480px with scroll area
- **Refresh button:** Manual refresh option

**Activity Card Structure:**
```
┌─────────────────────────────────────┐
│ [📦] Order Created    [Order]       │
│     New order PO-12345 created      │
│     🕐 2 hours ago • 🏢 Apt 101     │
└─────────────────────────────────────┘
```

---

## API Integration

### Endpoints Used

#### 1. `/api/dashboard/overview/`
**Method:** GET  
**Authentication:** Required (Bearer token)  
**Refresh:** Every 5 minutes  
**Cache:** 1 minute

**Response Structure:**
```json
{
  "kpi": {
    "active_apartments": {
      "value": 25,
      "trend": 12.5,
      "trend_label": "vs last month"
    },
    "pending_orders": {
      "value": 8,
      "trend": -10.0,
      "trend_label": "vs last week"
    },
    "open_issues": {
      "value": 3,
      "trend": 0,
      "trend_label": "no change"
    },
    "deliveries_this_week": {
      "value": 5,
      "trend": 25.0,
      "trend_label": "vs last week"
    },
    "overdue_payments": {
      "value": 2,
      "trend": -50.0,
      "trend_label": "vs last month"
    }
  },
  "orders_chart": [
    {
      "month": "Jun",
      "ordered": 15,
      "delivered": 12
    },
    // ... 5 more months
  ],
  "spending_chart": [
    {
      "month": "Jun",
      "amount": 125000.50
    },
    // ... 5 more months
  ]
}
```

#### 2. `/api/dashboard/recent-activities/`
**Method:** GET  
**Authentication:** Required (Bearer token)  
**Refresh:** Every 30 seconds  
**Cache:** 30 seconds

**Response Structure:**
```json
{
  "activities": [
    {
      "id": "uuid",
      "type": "order",
      "action": "created",
      "title": "Order Created",
      "description": "New order PO-12345 created",
      "icon": "shopping-cart",
      "apartment": "Apartment 101",
      "created_at": "2025-12-22T10:30:00Z"
    }
    // ... more activities
  ],
  "recent_orders": [
    {
      "id": "uuid",
      "po_number": "PO-12345",
      "apartment": "Apartment 101",
      "vendor": "IKEA",
      "total": 125000.50,
      "status": "processing",
      "placed_on": "2025-12-22T10:00:00Z"
    }
    // ... up to 5 orders
  ],
  "recent_issues": [
    {
      "id": "uuid",
      "title": "Damaged furniture",
      "apartment": "Apartment 101",
      "priority": "high",
      "status": "Open",
      "created_at": "2025-12-22T09:00:00Z"
    }
    // ... up to 10 issues
  ],
  "recent_payments": [
    {
      "id": "uuid",
      "vendor": "IKEA",
      "apartment": "Apartment 101",
      "order_reference": "PO-12345",
      "total_amount": 125000.50,
      "amount_paid": 125000.50,
      "outstanding": 0,
      "status": "Paid",
      "due_date": "2025-12-30"
    }
    // ... up to 10 payments
  ]
}
```

### Backend Implementation

**File:** `/root/buy2rent/backend/dashboard/views.py`

#### DashboardOverviewView
- Aggregates KPI data from multiple models
- Calculates trends by comparing time periods
- Generates chart data for last 6 months
- Handles errors gracefully with fallback data

**Database Queries:**
```python
# Active Apartments
Apartment.objects.count()

# Pending Orders
Order.objects.filter(status__in=['draft', 'confirmed', 'processing']).count()

# Open Issues
Issue.objects.filter(resolution_status__in=['Open', 'Pending Vendor Response']).count()

# Deliveries This Week
Delivery.objects.filter(
    Q(expected_date__gte=week_start, expected_date__lte=week_end) |
    Q(actual_date__gte=week_start, actual_date__lte=week_end)
).count()

# Overdue Payments
Payment.objects.filter(status__in=['Unpaid', 'Partial'], due_date__lt=today).count()
```

#### DashboardRecentActivitiesView
- Fetches recent activities from Activity model
- Retrieves recent orders, issues, payments
- Formats data for frontend consumption
- Includes related object names (apartment, vendor)

---

## User Workflows

### 1. Initial Page Load

```
User navigates to "/" → Overview page loads
                              ↓
                    Show loading skeletons
                              ↓
                    Fetch dashboard data
                              ↓
                    Display KPIs and charts
                              ↓
                    Fetch recent activities
                              ↓
                    Display activity feed
```

### 2. Monitoring Workflow

**Scenario:** Admin wants to monitor daily operations

1. **Check KPIs** → Quick glance at 5 key metrics
2. **Review Trends** → See if metrics are improving/declining
3. **Analyze Charts** → Understand monthly patterns
4. **Check Recent Orders** → See latest procurement activity
5. **Check Recent Payments** → Monitor payment status
6. **Review Activity Feed** → Track all system changes

### 3. Issue Detection Workflow

**Scenario:** Admin notices a problem

1. **KPI Alert** → "Overdue Payments: 5" (red trend)
2. **Click Recent Payments** → See which payments are overdue
3. **Navigate to Payments page** → (Future) Click for details
4. **Take Action** → Process payment or contact vendor

### 4. Performance Analysis Workflow

**Scenario:** Monthly review meeting

1. **Orders Chart** → Compare orders placed vs delivered
2. **Spending Chart** → Analyze spending patterns
3. **Trend Analysis** → Identify seasonal patterns
4. **KPI Comparison** → Month-over-month growth

---

## Technical Implementation

### State Management

**React Query** is used for all data fetching:

```typescript
// Overview data with auto-refresh
const { data: dashboardData, isLoading, refetch } = useDashboardOverview();
// Refetches every 5 minutes automatically

// Recent activities with faster refresh
const { data: recentData } = useDashboardRecentActivities();
// Refetches every 30 seconds automatically
```

**Benefits:**
- ✅ Automatic caching
- ✅ Background refetching
- ✅ Loading states
- ✅ Error handling
- ✅ Optimistic updates

### Loading States

**Skeleton Loading:**
```typescript
if (isLoading) {
  return (
    <PageLayout title="Dashboard Overview">
      <div className="space-y-6">
        {/* KPI Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Chart Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card><Skeleton className="h-[300px] w-full" /></Card>
          <Card><Skeleton className="h-[300px] w-full" /></Card>
        </div>
      </div>
    </PageLayout>
  );
}
```

### Error Handling

**Fallback Data:**
```typescript
// If API fails, use fallback data
const ordersData = dashboardData?.orders_chart || fallbackOrdersData;
const spendingData = dashboardData?.spending_chart || fallbackSpendingData;

// Fallback shows zero values
const fallbackOrdersData = [
  { month: 'Jun', ordered: 0, delivered: 0 },
  { month: 'Jul', ordered: 0, delivered: 0 },
  // ... etc
];
```

### Responsive Design

**Breakpoints:**
- **Mobile** (< 768px): Single column, stacked cards
- **Tablet** (768px - 1024px): 2 columns for charts
- **Desktop** (> 1024px): 5 columns for KPIs, 2 columns for charts

**Grid System:**
```typescript
// KPI Cards
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"

// Charts
className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"

// Recent Data
className="grid grid-cols-1 lg:grid-cols-2 gap-6"
```

---

## Performance & Optimization

### Caching Strategy

**React Query Configuration:**
```typescript
{
  queryKey: dashboardKeys.overview,
  queryFn: dashboardApi.getOverview,
  staleTime: 60 * 1000,        // Data fresh for 1 minute
  refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
}
```

**Benefits:**
- Reduces API calls
- Faster page loads on revisit
- Background updates without user action

### Data Optimization

**Backend Optimization:**
- Database queries use `select_related()` for foreign keys
- Aggregations done at database level
- Indexes on frequently queried fields
- Error handling prevents crashes

**Frontend Optimization:**
- Lazy loading for charts (only render when visible)
- Memoization of expensive calculations
- Virtual scrolling for activity feed (if needed)
- Debounced refresh actions

### Bundle Size

**Chart Library:** Recharts (~150KB gzipped)
- Tree-shaking enabled
- Only imports used components

**Icons:** Lucide React (~50KB gzipped)
- Tree-shaking enabled
- Only imports used icons

---

## Key Files Reference

### Frontend Files
```
/root/buy2rent/frontend/src/
├── pages/
│   └── Overview.tsx                    # Main page component
├── components/
│   ├── dashboard/
│   │   ├── KPICard.tsx                # KPI card component
│   │   └── ActivityFeed.tsx           # Activity feed component
│   └── layout/
│       └── PageLayout.tsx             # Page wrapper
├── hooks/
│   └── useDashboardApi.ts             # React Query hooks
└── services/
    └── dashboardApi.ts                # API service layer
```

### Backend Files
```
/root/buy2rent/backend/
├── dashboard/
│   ├── views.py                       # API views
│   ├── urls.py                        # URL routing
│   └── models.py                      # (Uses models from other apps)
├── apartments/models.py               # Apartment model
├── orders/models.py                   # Order model
├── deliveries/models.py               # Delivery model
├── payments/models.py                 # Payment model
├── issues/models.py                   # Issue model
└── activities/models.py               # Activity model
```

---

## Future Enhancements

### Planned Features
1. **Click-through navigation** from cards to detail pages
2. **Date range selector** for custom time periods
3. **Export to PDF/Excel** for reports
4. **Real-time notifications** via WebSocket
5. **Customizable KPIs** - user can choose which metrics to display
6. **Comparison mode** - compare current vs previous period
7. **Drill-down charts** - click chart to see details
8. **Dashboard templates** - different views for different roles

### Performance Improvements
1. **Server-side caching** with Redis
2. **GraphQL** for more efficient data fetching
3. **Progressive loading** - load critical data first
4. **Service Worker** for offline support

---

## Troubleshooting

### Common Issues

#### 1. KPIs showing 0
**Cause:** No data in database or API error  
**Solution:** Check backend logs, verify database has data

#### 2. Charts not rendering
**Cause:** Invalid data format or missing data  
**Solution:** Check browser console, verify API response format

#### 3. Activity feed empty
**Cause:** No activities logged or API error  
**Solution:** Perform some actions (create order, etc.) to generate activities

#### 4. Slow loading
**Cause:** Large dataset or slow database queries  
**Solution:** Add database indexes, optimize queries, implement pagination

---

## Summary

The Overview page is the **central command center** of the Buy2Rent system, providing:

✅ **Real-time monitoring** of 5 critical KPIs  
✅ **Visual analytics** with interactive charts  
✅ **Activity tracking** for all system operations  
✅ **Quick access** to recent data  
✅ **Auto-refresh** for up-to-date information  
✅ **Responsive design** for all devices  
✅ **Optimized performance** with smart caching  

**Technology Stack:**
- **Frontend:** React, TypeScript, TailwindCSS, Recharts, React Query
- **Backend:** Django REST Framework, PostgreSQL/SQLite
- **State Management:** React Query (TanStack Query)
- **UI Components:** shadcn/ui, Radix UI

**Key Metrics Tracked:**
- Apartments, Orders, Issues, Deliveries, Payments
- Monthly trends and comparisons
- Real-time activity logging

This page serves as the **first point of contact** for administrators and provides a comprehensive overview of the entire procurement operation at a glance.



The Overview page is the main dashboard that displays a snapshot of your entire apartment procurement business. At the top, you see five key metrics: total apartments, pending orders, open issues, deliveries scheduled for this week, and overdue payments - each showing whether numbers are trending up or down. Below that are two visual charts showing orders placed versus delivered over the last six months, and total spending trends. The page also lists your most recent orders and payments, along with a live activity feed that tracks every action happening in the system - like new orders created, payments received, or issues reported.

