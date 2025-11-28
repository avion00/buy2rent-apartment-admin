// API Configuration and Utilities
export const API_BASE_URL = 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Authentication
  login: `${API_BASE_URL}/auth/login/`,
  register: `${API_BASE_URL}/auth/register/`,
  refresh: `${API_BASE_URL}/auth/refresh/`,
  profile: `${API_BASE_URL}/auth/profile/`,
  passwordReset: `${API_BASE_URL}/auth/password-reset/`,
  
  // Main API endpoints
  clients: `${API_BASE_URL}/api/clients/`,
  apartments: `${API_BASE_URL}/api/apartments/`,
  products: `${API_BASE_URL}/api/products/`,
  vendors: `${API_BASE_URL}/api/vendors/`,
  issues: `${API_BASE_URL}/api/issues/`,
  payments: `${API_BASE_URL}/api/payments/`,
  deliveries: `${API_BASE_URL}/api/deliveries/`,
};

// API Request helper with automatic token handling
export class ApiClient {
  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private static async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle different error types
      if (response.status === 401) {
        // Token expired, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
      
      // Format error message
      let errorMessage = 'An error occurred';
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      } else if (errorData.errors) {
        errorMessage = Object.entries(errorData.errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
      }
      
      throw new Error(errorMessage);
    }
    
    return response.json();
  }

  static async get(url: string) {
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  static async post(url: string, data: any) {
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  static async put(url: string, data: any) {
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  static async patch(url: string, data: any) {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  static async delete(url: string) {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    
    if (response.status === 204) {
      return {}; // No content
    }
    
    return this.handleResponse(response);
  }
}

// Authentication API functions
export const authAPI = {
  login: (email: string, password: string) =>
    ApiClient.post(API_ENDPOINTS.login, { email, password }),
    
  register: (userData: {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    phone?: string;
    password: string;
    password_confirm: string;
  }) => ApiClient.post(API_ENDPOINTS.register, userData),
  
  refreshToken: (refresh: string) =>
    ApiClient.post(API_ENDPOINTS.refresh, { refresh }),
    
  getProfile: () => ApiClient.get(API_ENDPOINTS.profile),
  
  resetPassword: (email: string) =>
    ApiClient.post(API_ENDPOINTS.passwordReset, { email }),
};

// Main API functions
export const clientsAPI = {
  getAll: () => ApiClient.get(API_ENDPOINTS.clients),
  getById: (id: string) => ApiClient.get(`${API_ENDPOINTS.clients}${id}/`),
  create: (data: any) => ApiClient.post(API_ENDPOINTS.clients, data),
  update: (id: string, data: any) => ApiClient.put(`${API_ENDPOINTS.clients}${id}/`, data),
  delete: (id: string) => ApiClient.delete(`${API_ENDPOINTS.clients}${id}/`),
};

export const apartmentsAPI = {
  getAll: () => ApiClient.get(API_ENDPOINTS.apartments),
  getById: (id: string) => ApiClient.get(`${API_ENDPOINTS.apartments}${id}/`),
  create: (data: any) => ApiClient.post(API_ENDPOINTS.apartments, data),
  update: (id: string, data: any) => ApiClient.put(`${API_ENDPOINTS.apartments}${id}/`, data),
  delete: (id: string) => ApiClient.delete(`${API_ENDPOINTS.apartments}${id}/`),
};

export const productsAPI = {
  getAll: () => ApiClient.get(API_ENDPOINTS.products),
  getById: (id: string) => ApiClient.get(`${API_ENDPOINTS.products}${id}/`),
  create: (data: any) => ApiClient.post(API_ENDPOINTS.products, data),
  update: (id: string, data: any) => ApiClient.put(`${API_ENDPOINTS.products}${id}/`, data),
  delete: (id: string) => ApiClient.delete(`${API_ENDPOINTS.products}${id}/`),
};

export const vendorsAPI = {
  getAll: () => ApiClient.get(API_ENDPOINTS.vendors),
  getById: (id: string) => ApiClient.get(`${API_ENDPOINTS.vendors}${id}/`),
  create: (data: any) => ApiClient.post(API_ENDPOINTS.vendors, data),
  update: (id: string, data: any) => ApiClient.put(`${API_ENDPOINTS.vendors}${id}/`, data),
  delete: (id: string) => ApiClient.delete(`${API_ENDPOINTS.vendors}${id}/`),
};
