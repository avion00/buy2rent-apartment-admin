/**
 * Enhanced API hooks for VendorView page
 * Provides all the data needed for the VendorView.tsx component
 */
import { useQuery } from '@tanstack/react-query';
import { vendorApi } from '@/services/api';
import { API_BASE_URL } from '@/services/config';

// Generic API function for vendor-specific endpoints
async function apiGet<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
  const token = localStorage.getItem('access_token');
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(`API Error: ${response.status} ${response.statusText}`);
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

  return response.json();
}

// Types for VendorView data
export interface VendorViewProduct {
  id: string;
  product: string;
  apartment: string;
  price: number;
  qty: number;
  availability: string;
  status: string;
}

export interface VendorViewOrder {
  id: string;
  po_number: string;
  apartment: string;
  items_count: number;
  total: number;
  status: string;
  placed_on: string;
}

export interface VendorViewIssue {
  id: string;
  item: string;
  issue_type: string;
  description: string;
  priority: string;
  status: string;
  created_date: string;
}

export interface VendorViewPayment {
  id: string;
  order_no: string;
  apartment: string;
  amount: number;
  status: string;
  due_date: string;
  paid_date: string | null;
}

export interface VendorViewDetail {
  // Core vendor info
  id: string;
  name: string;
  logo: string;
  contact: string;
  website: string;
  lead_time: string;
  reliability: number | string; // Can be string from API
  orders_count: number;
  active_issues: number;
  
  // Address and business info
  address: string;
  city: string;
  country: string;
  postal_code: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  business_type: string;
  year_established: string;
  employee_count: string;
  
  // Related data
  products: VendorViewProduct[];
  orders: VendorViewOrder[];
  issues: VendorViewIssue[];
  payments: VendorViewPayment[];
  
  // Computed fields
  products_count: number;
  orders_total_value: number;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface VendorStatistics {
  vendor_info: {
    id: string;
    name: string;
    reliability: number;
    orders_count: number;
    active_issues: number;
  };
  products: {
    total: number;
    delivered: number;
    with_issues: number;
  };
  orders: {
    total: number;
    delivered: number;
    total_value: number;
  };
  payments: {
    total: number;
    paid: number;
    total_amount: number;
    outstanding_amount: number;
  };
  issues: {
    total: number;
    open: number;
  };
  performance: {
    on_time_delivery_rate: number;
    quality_rating: number;
    order_accuracy: number;
  };
}

/**
 * Get vendor details optimized for VendorView frontend
 */
export function useVendorDetail(vendorId: string) {
  return useQuery<VendorViewDetail>({
    queryKey: ['vendor-detail', vendorId],
    queryFn: () => apiGet<VendorViewDetail>(`/api/vendors/${vendorId}/frontend_detail/`),
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Get vendor details by name (for URL routing)
 */
export function useVendorDetailByName(vendorName: string) {
  return useQuery<VendorViewDetail>({
    queryKey: ['vendor-detail-by-name', vendorName],
    queryFn: () => apiGet<VendorViewDetail>('/api/vendors/frontend_detail_by_name/', { name: vendorName }),
    enabled: !!vendorName,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Utility function to check if a string is a UUID
 */
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Smart vendor detail hook that handles both UUID and name parameters
 */
export function useVendorDetailSmart(param: string) {
  const isId = isUUID(param);
  
  // Debug logging
  console.log('useVendorDetailSmart Debug:', {
    param,
    isId,
    paramLength: param?.length,
    uuidTest: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(param || '')
  });
  
  // Use ID-based query if param is UUID
  const idQuery = useQuery<VendorViewDetail>({
    queryKey: ['vendor-detail', param],
    queryFn: () => {
      console.log('Making ID-based API call:', `/api/vendors/${param}/frontend_detail/`);
      return apiGet<VendorViewDetail>(`/api/vendors/${param}/frontend_detail/`);
    },
    enabled: !!param && isId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
  
  // Use name-based query if param is not UUID
  const nameQuery = useQuery<VendorViewDetail>({
    queryKey: ['vendor-detail-by-name', param],
    queryFn: () => {
      console.log('Making name-based API call:', '/api/vendors/frontend_detail_by_name/', { name: param });
      return apiGet<VendorViewDetail>('/api/vendors/frontend_detail_by_name/', { name: param });
    },
    enabled: !!param && !isId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
  
  // Debug the results
  const result = isId ? idQuery : nameQuery;
  console.log('useVendorDetailSmart Result:', {
    isId,
    usingQuery: isId ? 'idQuery' : 'nameQuery',
    data: result.data,
    isLoading: result.isLoading,
    error: result.error?.message
  });
  
  // Return the appropriate query result
  return result;
}

/**
 * Get vendor statistics
 */
export function useVendorStatistics(vendorId: string) {
  return useQuery<VendorStatistics>({
    queryKey: ['vendor-statistics', vendorId],
    queryFn: () => apiGet<VendorStatistics>(`/api/vendors/${vendorId}/statistics/`),
    enabled: !!vendorId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get vendor products
 */
export function useVendorProducts(vendorId: string) {
  return useQuery<VendorViewProduct[]>({
    queryKey: ['vendor-products', vendorId],
    queryFn: () => apiGet<VendorViewProduct[]>(`/api/vendors/${vendorId}/products/`),
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get vendor orders
 */
export function useVendorOrders(vendorId: string) {
  return useQuery<VendorViewOrder[]>({
    queryKey: ['vendor-orders', vendorId],
    queryFn: () => apiGet<VendorViewOrder[]>(`/api/vendors/${vendorId}/orders/`),
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get vendor issues
 */
export function useVendorIssues(vendorId: string) {
  return useQuery<VendorViewIssue[]>({
    queryKey: ['vendor-issues', vendorId],
    queryFn: () => apiGet<VendorViewIssue[]>(`/api/vendors/${vendorId}/issues/`),
    enabled: !!vendorId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get vendor payments
 */
export function useVendorPayments(vendorId: string) {
  return useQuery<VendorViewPayment[]>({
    queryKey: ['vendor-payments', vendorId],
    queryFn: () => apiGet<VendorViewPayment[]>(`/api/vendors/${vendorId}/payments/`),
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
