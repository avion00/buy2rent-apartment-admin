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
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface DeliveryStatusHistoryItem {
  id: string;
  status: string;
  notes: string;
  changed_by: string;
  received_by: string;
  location: string;
  delay_reason: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  product: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  description?: string;
  notes?: string;
}

export interface ApartmentDetails {
  id: string;
  name: string;
  address: string;
  type: string;
  status: string;
  owner: string;
  client_id: string;
  client_details?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export interface VendorDetails {
  id: string;
  name: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  country: string;
  delivery_terms: string;
  payment_terms: string;
}

export interface Delivery {
  id: string;
  order: string | null;
  apartment: string;
  apartment_name: string;
  apartment_details?: ApartmentDetails;
  vendor: string;
  vendor_name: string;
  vendor_details?: VendorDetails;
  order_reference: string;
  expected_date: string;
  actual_date: string | null;
  time_slot_start: string | null;
  time_slot_end: string | null;
  time_slot: string | null;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  tracking_number: string;
  received_by: string;
  status: 'Scheduled' | 'In Transit' | 'Delivered' | 'Delayed' | 'Cancelled' | 'Returned' | 'Issue Reported';
  notes: string;
  proof_photos: string[];
  order_total: number | null;
  order_items_count: number | null;
  order_items: OrderItem[];
  order_status: string | null;
  order_shipping_address: string | null;
  order_notes: string | null;
  status_history: DeliveryStatusHistoryItem[];
  created_at: string;
  updated_at: string;
}

export interface DeliveryListItem {
  id: string;
  order: string | null;
  apartment_name: string;
  vendor_name: string;
  order_reference: string;
  expected_date: string;
  time_slot: string | null;
  priority: string;
  tracking_number: string;
  status: string;
}

export interface DeliveryFilters {
  search?: string;
  status?: string;
  priority?: string;
  apartment?: string;
  vendor?: string;
  page?: number;
  page_size?: number;
}

export interface DeliveryListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DeliveryListItem[];
}

export interface CreateDeliveryData {
  order?: string;
  apartment: string;
  vendor: string;
  order_reference: string;
  expected_date: string;
  time_slot_start?: string;
  time_slot_end?: string;
  priority?: string;
  tracking_number?: string;
  status?: string;
  notes?: string;
}

export interface UpdateDeliveryData extends Partial<CreateDeliveryData> {
  actual_date?: string;
  received_by?: string;
  proof_photos?: string[];
}

export const deliveryApi = {
  getDeliveries: async (filters: DeliveryFilters = {}): Promise<DeliveryListResponse> => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.apartment) params.append('apartment', filters.apartment);
    if (filters.vendor) params.append('vendor', filters.vendor);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.page_size) params.append('page_size', filters.page_size.toString());
    
    const response = await axiosInstance.get(`/deliveries/?${params.toString()}`);
    return response.data;
  },

  getDelivery: async (id: string): Promise<Delivery> => {
    const response = await axiosInstance.get(`/deliveries/${id}/`);
    return response.data;
  },

  createDelivery: async (data: CreateDeliveryData): Promise<Delivery> => {
    const response = await axiosInstance.post('/deliveries/', data);
    return response.data;
  },

  updateDelivery: async (id: string, data: UpdateDeliveryData): Promise<Delivery> => {
    const response = await axiosInstance.patch(`/deliveries/${id}/`, data);
    return response.data;
  },

  deleteDelivery: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/deliveries/${id}/`);
  },

  updateStatus: async (id: string, status: string, additionalData?: { 
    received_by?: string; 
    actual_date?: string;
    status_notes?: string;
    location?: string;
    delay_reason?: string;
  }): Promise<Delivery> => {
    const response = await axiosInstance.patch(`/deliveries/${id}/`, {
      status,
      ...additionalData,
    });
    return response.data;
  },
};

export default deliveryApi;
