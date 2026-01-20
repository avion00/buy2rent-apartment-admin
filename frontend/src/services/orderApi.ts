import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL } from '../config/api';

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface OrderItem {
  id?: string;
  product: string;
  product_name?: string;
  product_image?: string;
  product_image_url?: string;
  sku?: string;
  quantity: number;
  unit_price: string | number;
  total_price: string | number;
  description?: string;
  specifications?: Record<string, any>;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  po_number: string;
  apartment: string;
  apartment_name?: string;
  vendor: string;
  vendor_name?: string;
  items: OrderItem[];
  items_count: number;
  total: string | number;
  status: string;
  confirmation_code?: string;
  placed_on: string;
  expected_delivery?: string;
  actual_delivery?: string;
  is_delivered: boolean;
  tracking_number?: string;
  shipping_address?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Order[];
}

export interface CreateOrderData {
  apartment: string;
  vendor: string;
  items: {
    product: string;
    quantity: number;
    unit_price: number;
    notes?: string;
  }[];
  expected_delivery?: string;
  notes?: string;
}

export interface UpdateOrderData {
  status?: string;
  expected_delivery?: string;
  actual_delivery?: string;
  notes?: string;
  items?: OrderItem[];
}

export interface OrderStatistics {
  total_orders: number;
  total_value: number;
  pending_orders: number;
  confirmed_orders: number;
  delivered_orders: number;
  average_order_value: number;
  orders_by_status: Record<string, number>;
  orders_by_vendor: Record<string, number>;
  monthly_orders: Array<{
    month: string;
    count: number;
    value: number;
  }>;
}

export interface VendorSpending {
  vendor: string;
  amount: number;
  orders: number;
}

export interface MonthlyOrderTrend {
  month: string;
  orders: number;
  spending: number;
}

export interface DashboardChartData {
  monthly_orders: Array<{
    month: string;
    orders: number;
    value: number;
  }>;
  vendor_spending: VendorSpending[];
}

export const orderApi = {
  // Get all orders with optional filters
  getOrders: async (params?: {
    search?: string;
    status?: string;
    vendor?: string;
    apartment?: string;
    ordering?: string;
    page?: number;
    page_size?: number;
  }): Promise<OrderListResponse> => {
    const response = await axiosInstance.get('/orders/', { params });
    return response.data;
  },

  // Get order by ID
  getOrder: async (id: string): Promise<Order> => {
    const response = await axiosInstance.get(`/orders/${id}/`);
    return response.data;
  },

  // Create new order
  createOrder: async (data: CreateOrderData): Promise<Order> => {
    const response = await axiosInstance.post('/orders/', data);
    return response.data;
  },

  // Update order
  updateOrder: async (id: string, data: UpdateOrderData): Promise<Order> => {
    const response = await axiosInstance.patch(`/orders/${id}/`, data);
    return response.data;
  },

  // Delete order
  deleteOrder: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/orders/${id}/`);
  },

  // Get order statistics
  getStatistics: async (): Promise<OrderStatistics> => {
    const response = await axiosInstance.get('/orders/statistics/');
    return response.data;
  },

  // Update order status
  updateStatus: async (id: string, status: string): Promise<Order> => {
    const response = await axiosInstance.patch(`/orders/${id}/update_status/`, { status });
    return response.data;
  },

  // Mark order as delivered
  markDelivered: async (id: string, deliveryDate?: string): Promise<Order> => {
    const response = await axiosInstance.patch(`/orders/${id}/`, {
      status: 'delivered',
      actual_delivery: deliveryDate || new Date().toISOString().split('T')[0],
      is_delivered: true
    });
    return response.data;
  },

  // Get orders by vendor
  getVendorOrders: async (vendorId: string): Promise<OrderListResponse> => {
    const response = await axiosInstance.get('/orders/', {
      params: { vendor: vendorId }
    });
    return response.data;
  },

  // Get orders by apartment
  getApartmentOrders: async (apartmentId: string): Promise<OrderListResponse> => {
    const response = await axiosInstance.get('/orders/', {
      params: { apartment: apartmentId }
    });
    return response.data;
  },

  // Get dashboard chart data
  getDashboardCharts: async (): Promise<DashboardChartData> => {
    const response = await axiosInstance.get('/dashboard/charts/');
    return response.data;
  },

  // Import order from Excel/CSV file
  importOrder: async (data: {
    file: File;
    apartment_id: string;
    vendor_id: string;
    po_number: string;
    status?: string;
    confirmation_code?: string;
    tracking_number?: string;
    expected_delivery?: string;
    shipping_address?: string;
    notes?: string;
  }): Promise<{
    message: string;
    order_created: boolean;
    order_id: string;
    po_number: string;
    total_items: number;
    successful_imports: number;
    failed_imports: number;
    total_amount: number;
    errors: string[];
  }> => {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('apartment_id', data.apartment_id);
    formData.append('vendor_id', data.vendor_id);
    formData.append('po_number', data.po_number);
    
    if (data.status) formData.append('status', data.status);
    if (data.confirmation_code) formData.append('confirmation_code', data.confirmation_code);
    if (data.tracking_number) formData.append('tracking_number', data.tracking_number);
    if (data.expected_delivery) formData.append('expected_delivery', data.expected_delivery);
    if (data.shipping_address) formData.append('shipping_address', data.shipping_address);
    if (data.notes) formData.append('notes', data.notes);
    
    const response = await axiosInstance.post('/orders/import_order/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
