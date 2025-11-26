import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';
const AUTH_BASE_URL = 'http://localhost:8000/auth';

// Create axios instance with optimized config for smooth async operations
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Enable credentials for CORS
  withCredentials: false,
  // Validate status more flexibly
  validateStatus: (status) => status < 500,
});

// Add request/response timing for performance monitoring
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig & { metadata?: { startTime: number } }) => {
    config.metadata = { startTime: Date.now() };
    return config;
  },
  (error) => Promise.reject(error)
);

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axiosInstance(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        // No refresh token, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${AUTH_BASE_URL}/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);
        
        // Update the authorization header for the original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }
        
        processQueue(null, access);
        
        // Retry the original request with new token
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        processQueue(refreshError, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    if (error.response?.data) {
      const errorData = error.response.data as any;
      const errorMessage = errorData.error || errorData.detail || errorData.message || 'An error occurred';
      return Promise.reject(new Error(errorMessage));
    }

    return Promise.reject(error);
  }
);

// Client type definition
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  account_status: 'Active' | 'Inactive' | 'Suspended';
  type: 'Individual' | 'Company';
  notes?: string;
  apartments_count: number;
  created_at: string;
  updated_at: string;
}

export interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  address?: string;
  account_status: 'Active' | 'Inactive' | 'Suspended';
  type: 'Individual' | 'Company';
  notes?: string;
}

// API response types
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Client API service with smooth async operations
export const clientApi = {
  // Get all clients with optional filters - optimized with axios
  async getClients(params?: {
    search?: string;
    account_status?: string;
    type?: string;
    page?: number;
    page_size?: number;
    ordering?: string;
  }): Promise<PaginatedResponse<Client>> {
    const response = await axiosInstance.get<PaginatedResponse<Client>>('/clients/', {
      params,
      // Add request cancellation support
      signal: new AbortController().signal,
    });
    return response.data;
  },

  // Get single client by ID - with caching headers
  async getClient(id: string): Promise<Client> {
    const response = await axiosInstance.get<Client>(`/clients/${id}/`, {
      headers: {
        'Cache-Control': 'max-age=300', // Cache for 5 minutes
      },
    });
    return response.data;
  },

  // Create new client - with optimistic response
  async createClient(data: ClientFormData): Promise<Client> {
    const response = await axiosInstance.post<Client>('/clients/', data);
    return response.data;
  },

  // Update client (partial update) - with concurrent request handling
  async updateClient(id: string, data: Partial<ClientFormData>): Promise<Client> {
    const response = await axiosInstance.patch<Client>(`/clients/${id}/`, data);
    return response.data;
  },

  // Delete client - with proper cleanup
  async deleteClient(id: string): Promise<void> {
    await axiosInstance.delete(`/clients/${id}/`);
  },

  // Replace client (full update) - with validation
  async replaceClient(id: string, data: ClientFormData): Promise<Client> {
    const response = await axiosInstance.put<Client>(`/clients/${id}/`, data);
    return response.data;
  },

  // Batch operations for better performance
  async batchGetClients(ids: string[]): Promise<Client[]> {
    const promises = ids.map(id => this.getClient(id));
    return Promise.all(promises);
  },

  // Check if email exists (for validation)
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const response = await axiosInstance.get<PaginatedResponse<Client>>('/clients/', {
        params: { search: email },
      });
      return response.data.results.some(client => client.email === email);
    } catch {
      return false;
    }
  },

  // Get client apartments
  async getClientApartments(clientId: string): Promise<any> {
    const response = await axiosInstance.get(`/clients/${clientId}/apartments/`);
    return response.data;
  },

  // Get client products
  async getClientProducts(clientId: string): Promise<any> {
    const response = await axiosInstance.get(`/clients/${clientId}/products/`);
    return response.data;
  },

  // Get client details (overview with apartments, products, statistics)
  async getClientDetails(clientId: string): Promise<any> {
    const response = await axiosInstance.get(`/clients/${clientId}/details/`);
    return response.data;
  },
};
