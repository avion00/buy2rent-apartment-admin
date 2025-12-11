import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance for search requests
const searchAxios: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor to add auth token
searchAxios.interceptors.request.use(
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
searchAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Search API error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Types
export interface SearchResultApartment {
  id: string;
  name: string;
  address: string;
  status: string;
  type: string;
}

export interface SearchResultClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  account_status: string;
  type: string;
}

export interface SearchResultVendor {
  id: string;
  name: string;
  company_name: string;
  email: string;
  contact_person: string;
}

export interface SearchResultProduct {
  id: string;
  apartment_id: string;
  product: string;
  vendor: string;
  sku: string;
  status: string;
  category: string;
}

export interface SearchResultDelivery {
  id: string;
  order_reference: string;
  vendor: string;
  status: string;
  expected_date: string | null;
}

export interface SearchResultIssue {
  id: string;
  apartment_id: string;
  product_name: string;
  type: string;
  status: string;
  priority: string;
}

export interface GlobalSearchResponse {
  apartments: SearchResultApartment[];
  clients: SearchResultClient[];
  vendors: SearchResultVendor[];
  products: SearchResultProduct[];
  deliveries: SearchResultDelivery[];
  issues: SearchResultIssue[];
  query: string;
  total_results: number;
}

// Search API service
export const searchApi = {
  // Global search across all entities
  async globalSearch(query: string, limit: number = 5): Promise<GlobalSearchResponse> {
    const response = await searchAxios.get<GlobalSearchResponse>('/search/', {
      params: { q: query, limit }
    });
    return response.data;
  },
};
