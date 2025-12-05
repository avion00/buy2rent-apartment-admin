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

export interface Vendor {
  id: string;
  name: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  website: string;
  logo: string;
  lead_time: string;
  reliability: string;
  orders_count: number;
  active_issues: number;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  tax_id: string;
  business_type: string;
  year_established: string;
  employee_count: string;
  category: string;
  product_categories?: string;
  certifications?: string;
  specializations?: string;
  payment_terms?: string;
  delivery_terms?: string;
  warranty_period?: string;
  return_policy?: string;
  minimum_order?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VendorListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Vendor[];
}

export interface CreateVendorData {
  name: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  website?: string;
  logo?: string;
  lead_time?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  tax_id?: string;
  business_type?: string;
  year_established?: string;
  employee_count?: string;
  category?: string;
  product_categories?: string;
  certifications?: string;
  specializations?: string;
  payment_terms?: string;
  delivery_terms?: string;
  warranty_period?: string;
  return_policy?: string;
  minimum_order?: string;
  notes?: string;
}

export interface UpdateVendorData extends Partial<CreateVendorData> {}

export interface VendorProduct {
  id: string;
  apartment: string;
  apartment_details?: {
    id: string;
    name: string;
    type: string;
    client: string;
    client_id: string;
    client_details: {
      id: string;
      name: string;
      email: string;
      phone: string;
      account_status: string;
      type: string;
      notes: string;
      apartments_count: number;
      created_at: string;
      updated_at: string;
    };
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
  category: string;
  category_details?: {
    id: string;
    name: string;
    sheet_name: string;
    room_type: string;
  };
  category_name: string;
  product: string;
  description: string;
  vendor: string;
  vendor_details: {
    id: string;
    name: string;
    company_name: string;
    contact_person: string;
    email: string;
    phone: string;
    website: string;
    logo: string;
    lead_time: string;
    reliability: string;
    orders_count: number;
    active_issues: number;
  };
  vendor_name: string;
  vendor_link: string;
  sku: string;
  unit_price: string | number;
  qty: number;
  availability: string;
  status: string[];
  dimensions: string;
  weight: string;
  material: string;
  color: string;
  model_number: string;
  sn: string;
  product_image: string;
  cost: string;
  total_cost: string | number;
  link: string;
  size: string;
  room: string;
  brand: string;
  country_of_origin: string;
  payment_status: string;
  payment_due_date: string | null;
  payment_amount: string | null;
  paid_amount: string;
  currency: string;
  shipping_cost: string;
  discount: string;
  total_amount: string;
  outstanding_balance: string;
  delivery_status_tags: string[];
  issue_state: string;
  issue_type: string;
  issue_description: string;
  image_url: string;
  thumbnail_url: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export const vendorApi = {
  // Get all vendors with optional search
  getVendors: async (search?: string): Promise<VendorListResponse> => {
    const params = search ? { search } : {};
    const response = await axiosInstance.get('/vendors/', { params });
    return response.data;
  },

  // Get vendor by ID
  getVendor: async (id: string): Promise<Vendor> => {
    const response = await axiosInstance.get(`/vendors/${id}/`);
    return response.data;
  },

  // Create new vendor
  createVendor: async (data: CreateVendorData): Promise<Vendor> => {
    const response = await axiosInstance.post('/vendors/', data);
    return response.data;
  },

  // Update vendor
  updateVendor: async (id: string, data: UpdateVendorData): Promise<Vendor> => {
    const response = await axiosInstance.patch(`/vendors/${id}/`, data);
    return response.data;
  },

  // Delete vendor
  deleteVendor: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/vendors/${id}/`);
  },

  // Get vendor products
  getVendorProducts: async (vendorId: string): Promise<VendorProduct[]> => {
    const response = await axiosInstance.get(`/vendors/${vendorId}/products/`);
    return response.data;
  },

  // Remove product from vendor
  removeVendorProduct: async (vendorId: string, productId: string): Promise<void> => {
    await axiosInstance.delete(`/vendors/${vendorId}/products/${productId}/`);
  },
};
