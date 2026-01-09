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
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Apartment type definition
export interface ClientDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  account_status: 'Active' | 'Inactive' | 'Suspended';
  type: 'Investor' | 'Buy2Rent Internal';
  notes?: string;
  apartments_count: number;
  created_at: string;
  updated_at: string;
}

export interface Apartment {
  id: string;
  name: string;
  type: 'furnishing' | 'renovating';
  client: string;
  client_id: string;
  client_details: ClientDetails;
  owner: string; // Deprecated - use client_details.name
  address: string;
  status: 'Planning' | 'Design Approved' | 'Ordering' | 'Delivery' | 'Installation' | 'Completed';
  designer: string;
  start_date: string;
  due_date: string;
  progress: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ApartmentFormData {
  name: string;
  type: 'furnishing' | 'renovating';
  client: string;
  address: string;
  status: 'Planning' | 'Design Approved' | 'Ordering' | 'Delivery' | 'Installation' | 'Completed';
  designer: string;
  start_date: string;
  due_date: string;
  progress?: number;
  notes?: string;
}

// API response types
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// API functions
export const apartmentApi = {
  // Get all apartments with optional filters
  getApartments: async (params?: {
    search?: string;
    type?: string;
    status?: string;
    client?: string;
    page?: number;
    page_size?: number;
    ordering?: string;
  }): Promise<PaginatedResponse<Apartment>> => {
    const response = await axiosInstance.get('/apartments/', { params });
    return response.data;
  },

  // Get single apartment
  getApartment: async (id: string): Promise<Apartment> => {
    const response = await axiosInstance.get(`/apartments/${id}/`);
    return response.data;
  },

  // Create apartment
  createApartment: async (data: ApartmentFormData): Promise<Apartment> => {
    const response = await axiosInstance.post('/apartments/', data);
    return response.data;
  },

  // Update apartment
  updateApartment: async (id: string, data: Partial<ApartmentFormData>): Promise<Apartment> => {
    const response = await axiosInstance.put(`/apartments/${id}/`, data);
    return response.data;
  },

  // Partial update apartment
  patchApartment: async (id: string, data: Partial<ApartmentFormData>): Promise<Apartment> => {
    const response = await axiosInstance.patch(`/apartments/${id}/`, data);
    return response.data;
  },

  // Delete apartment
  deleteApartment: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/apartments/${id}/`);
  },
};
