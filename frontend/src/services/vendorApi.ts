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
}

export interface VendorListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Vendor[];
}

export const vendorApi = {
  // Get all vendors
  getVendors: async (): Promise<VendorListResponse> => {
    const response = await axiosInstance.get('/vendors/');
    return response.data;
  },

  // Get vendor by ID
  getVendor: async (id: string): Promise<Vendor> => {
    const response = await axiosInstance.get(`/vendors/${id}/`);
    return response.data;
  },
};
