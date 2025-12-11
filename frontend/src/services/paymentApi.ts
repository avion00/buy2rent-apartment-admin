import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

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
      // Token expired or invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Payment type definitions
export interface OrderItemSummary {
  id: string;
  product: string;
  product_name: string;
  product_image: string | null;
  sku: string;
  quantity: number;
  unit_price: string;
  total_price: string;
}

export interface OrderSummary {
  id: string;
  po_number: string;
  apartment_name: string;
  vendor_name: string;
  items_count: number;
  total: string;
  status: string;
  placed_on: string;
}

export interface Payment {
  id: string;
  // Order relationship
  order: string | null;
  order_details: OrderSummary | null;
  // Apartment & Vendor
  apartment: string;
  apartment_details: {
    id: string;
    name: string;
    type: string;
    client: string;
    client_id: string;
    owner: string;
    address: string;
    status: string;
    designer: string;
    start_date: string;
    due_date: string;
    progress: number;
    notes: string;
    created_at: string;
    updated_at: string;
  };
  vendor: string;
  vendor_details: {
    id: string;
    name: string;
    contact_person: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    website: string;
    notes: string;
    created_at: string;
    updated_at: string;
  };
  vendor_name: string;
  order_reference: string;
  // Amount fields (integers for HUF)
  total_amount: number;
  shipping_cost: number;
  discount: number;
  final_total: number;
  amount_paid: number;
  outstanding_amount: number;
  // Payment details
  due_date: string;
  status: 'Unpaid' | 'Partial' | 'Paid' | 'Overdue';
  last_payment_date: string | null;
  notes: string;
  payment_method: 'Bank Transfer' | 'Card Payment' | 'Cash';
  reference_number: string;
  // Bank Transfer details
  bank_name: string;
  account_holder: string;
  account_number: string;
  iban: string;
  // Card Payment details
  card_holder: string;
  card_last_four: string;
  // Order items (new)
  order_items: string[];
  order_item_details: OrderItemSummary[];
  order_items_count: number;
  // Products (legacy)
  products: string[];
  product_details: ProductSummary[];
  product_count: number;
  // Payment history
  payment_history: PaymentHistory[];
  created_at: string;
  updated_at: string;
}

export interface ProductSummary {
  id: string;
  product: string;
  category_name: string;
  unit_price: string;
  qty: number;
  payment_status: string;
}

export interface PaymentHistory {
  id: string;
  payment: string;
  payment_reference?: string;
  date: string;
  amount: number;
  method: string;
  reference_no: string;
  note: string;
  created_at: string;
}

export interface PaymentFormData {
  order?: string;
  apartment?: string;
  vendor?: string;
  order_reference?: string;
  due_date: string;
  total_amount: string;
  amount_paid: string;
  status: string;
  last_payment_date?: string | null;
  notes?: string;
  order_items?: string[];
  products?: string[];
}

export interface CreatePaymentFromOrderData {
  order: string;
  order_items?: string[];
  due_date: string;
  // Amount fields
  total_amount?: number;
  shipping_cost?: number;
  discount?: number;
  amount_paid?: number;
  // Payment method
  payment_method?: 'Bank Transfer' | 'Card Payment' | 'Cash';
  reference_number?: string;
  notes?: string;
  // Bank Transfer details
  bank_name?: string;
  account_holder?: string;
  account_number?: string;
  iban?: string;
  // Card Payment details
  card_holder?: string;
  card_last_four?: string;
}

export interface PaymentListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Payment[];
}

// API methods
export const paymentApi = {
  // Get all payments
  getPayments: async (params?: {
    page?: number;
    page_size?: number;
    apartment?: string;
    vendor?: string;
    status?: string;
    search?: string;
    ordering?: string;
  }): Promise<PaymentListResponse> => {
    const response = await axiosInstance.get('/payments/', { params });
    return response.data;
  },

  // Get single payment
  getPayment: async (id: string): Promise<Payment> => {
    const response = await axiosInstance.get(`/payments/${id}/`);
    return response.data;
  },

  // Create payment
  createPayment: async (data: PaymentFormData): Promise<Payment> => {
    const response = await axiosInstance.post('/payments/', data);
    return response.data;
  },

  // Create payment from an order (new endpoint)
  createPaymentFromOrder: async (data: CreatePaymentFromOrderData): Promise<Payment> => {
    const response = await axiosInstance.post('/payments/from-order/', data);
    return response.data;
  },

  // Update payment
  updatePayment: async (id: string, data: Partial<PaymentFormData>): Promise<Payment> => {
    const response = await axiosInstance.put(`/payments/${id}/`, data);
    return response.data;
  },

  // Partial update payment
  patchPayment: async (id: string, data: Partial<PaymentFormData>): Promise<Payment> => {
    const response = await axiosInstance.patch(`/payments/${id}/`, data);
    return response.data;
  },

  // Delete payment
  deletePayment: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/payments/${id}/`);
  },

  // Get payment history
  getPaymentHistory: async (paymentId?: string): Promise<PaymentHistory[]> => {
    const params = paymentId ? { payment: paymentId } : {};
    const response = await axiosInstance.get('/payment-history/', { params });
    return response.data.results || response.data;
  },

  // Create payment history entry
  createPaymentHistory: async (data: {
    payment: string;
    date: string;
    amount: number;
    method: string;
    reference_no?: string;
    note?: string;
  }): Promise<PaymentHistory> => {
    const response = await axiosInstance.post('/payment-history/', data);
    return response.data;
  },

  // Delete payment history entry
  deletePaymentHistory: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/payment-history/${id}/`);
  },
};
