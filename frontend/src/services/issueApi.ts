import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL, AUTH_BASE_URL } from '../config/api';

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

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

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
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest?._retry) {
      if (originalRequest?.url?.includes('/refresh/')) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => axiosInstance(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        isRefreshing = false;
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(`${AUTH_BASE_URL}/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = refreshResponse.data;
        localStorage.setItem('access_token', access);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }

        processQueue();
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Types
export interface IssuePhoto {
  id: string;
  url: string;
  uploaded_at: string;
}

export interface AICommunicationLog {
  id: string;
  timestamp: string;
  sender: 'AI' | 'Vendor' | 'System' | 'Admin';
  message: string;
  html_content?: string;
  message_type?: 'email' | 'internal' | 'system';
  subject?: string;
  email_from?: string;
  email_to?: string;
  status?: string;
  ai_generated?: boolean;
  ai_confidence?: number;
  approved_by?: string;
  approved_at?: string;
}

export interface Issue {
  id: string;
  apartment: string;
  apartment_details?: {
    id: string;
    name: string;
    address?: string;
  };
  product?: string | null;
  product_details?: {
    id: string;
    product: string;
    sku?: string;
    category?: string;
    unit_price?: string | number;
    product_image?: string;
    image_url?: string;
    image_file?: string;
  };
  order?: string | null;
  order_details?: any;
  order_item?: string | null;
  order_item_details?: {
    id: string;
    product_name?: string;
    product_image?: string;
    product_image_url?: string;
    sku?: string;
    quantity?: number;
    unit_price?: string | number;
    total_price?: string | number;
  };
  product_name?: string;
  display_product_name?: string;
  vendor: string;
  vendor_details?: {
    id: string;
    name: string;
    contact_person?: string;
    email?: string;
    phone?: string;
  };
  vendor_name?: string;
  type: string;
  description: string;
  reported_on: string;
  status: 'Open' | 'Pending Vendor Response' | 'Resolution Agreed' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  expected_resolution: string | null;
  vendor_contact?: string;
  impact?: string;
  replacement_eta: string | null;
  ai_activated: boolean;
  resolution_status: string;
  resolution_type?: string;
  resolution_notes?: string;
  delivery_date?: string | null;
  invoice_number?: string;
  tracking_number?: string;
  auto_notify_vendor?: boolean;
  photos: IssuePhoto[];
  ai_communication_log: AICommunicationLog[];
  // Multiple items per issue
  items?: IssueItem[];
  items_count?: number;
  created_at: string;
  updated_at: string;
}

export interface IssueListItem {
  id: string;
  apartment: string;
  apartment_name?: string;
  apartment_details?: any;
  product?: string | null;
  product_name?: string;
  display_product_name?: string;
  product_details?: {
    id: string;
    product: string;
    sku?: string;
    product_image?: string;
    image_url?: string;
  };
  order?: string | null;
  order_item?: string | null;
  order_item_details?: {
    id: string;
    product_name?: string;
    product_image?: string;
    product_image_url?: string;
  };
  vendor: string;
  vendor_name?: string;
  vendor_details?: any;
  type: string;
  description: string;
  reported_on: string;
  status: string;
  priority: string;
  expected_resolution: string | null;
  ai_activated: boolean;
  created_at: string;
  photos?: { id: string; url: string }[];
  aiCommunicationLog?: { id: string; message: string }[];
  // New: Multiple items per issue
  items?: IssueItem[];
  items_count?: number;
}

// New interface for issue items (multiple products per issue)
export interface IssueItem {
  id: string;
  order_item?: string | null;
  product?: string | null;
  product_name: string;
  order_item_product_name?: string;
  quantity_affected: number;
  issue_types: string;
  description: string;
  product_image?: string | null;
  created_at: string;
}

// Data for creating issue items
export interface IssueItemData {
  order_item?: string | null;
  product?: string | null;
  product_name: string;
  quantity_affected: number;
  issue_types: string;
  description: string;
}

export interface CreateIssueData {
  apartment: string;
  product?: string | null;
  vendor: string;
  order?: string | null;
  order_item?: string | null;
  product_name?: string;
  type?: string;
  description?: string;
  status?: string;
  priority?: string;
  expected_resolution?: string;
  vendor_contact?: string;
  impact?: string;
  replacement_eta?: string;
  ai_activated?: boolean;
  resolution_status?: string;
  resolution_type?: string;
  resolution_notes?: string;
  delivery_date?: string;
  invoice_number?: string;
  tracking_number?: string;
  auto_notify_vendor?: boolean;
  // New: Multiple items per issue
  items_data?: IssueItemData[];
}

export interface UpdateIssueData {
  type?: string;
  description?: string;
  status?: string;
  priority?: string;
  expected_resolution?: string;
  vendor_contact?: string;
  impact?: string;
  replacement_eta?: string;
  ai_activated?: boolean;
  resolution_status?: string;
  resolution_type?: string;
  resolution_notes?: string;
  delivery_date?: string;
  invoice_number?: string;
  tracking_number?: string;
  auto_notify_vendor?: boolean;
  // Additional fields for comprehensive updates
  apartment?: string;
  vendor?: string;
  order?: string;
  product?: string;
  product_name?: string;
  items_data?: IssueItemData[];
}

export interface IssueListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: IssueListItem[];
}

export interface IssueFilters {
  search?: string;
  status?: string;
  priority?: string;
  apartment?: string;
  vendor?: string;
  product?: string;
  page?: number;
  page_size?: number;
}

export const issueApi = {
  getIssues: async (filters: IssueFilters = {}): Promise<IssueListResponse> => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.apartment) params.append('apartment', filters.apartment);
    if (filters.vendor) params.append('vendor', filters.vendor);
    if (filters.product) params.append('product', filters.product);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.page_size) params.append('page_size', filters.page_size.toString());
    
    const response = await axiosInstance.get(`/issues/?${params.toString()}`);
    return response.data;
  },

  getIssue: async (id: string): Promise<Issue> => {
    const response = await axiosInstance.get(`/issues/${id}/`);
    return response.data;
  },

  createIssue: async (data: CreateIssueData): Promise<Issue> => {
    const response = await axiosInstance.post('/issues/', data);
    return response.data;
  },

  updateIssue: async (id: string, data: UpdateIssueData): Promise<Issue> => {
    const response = await axiosInstance.patch(`/issues/${id}/`, data);
    return response.data;
  },

  deleteIssue: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/issues/${id}/`);
  },

  // Upload photo to an issue
  uploadPhoto: async (issueId: string, photoUrl: string): Promise<IssuePhoto> => {
    const response = await axiosInstance.post(`/issues/${issueId}/photos/`, { url: photoUrl });
    return response.data;
  },

  // AI Email Management endpoints
  activateAIEmail: async (issueId: string) => {
    const response = await axiosInstance.post(`/issues/${issueId}/activate_ai_email/`);
    return response;
  },

  getEmailThread: async (issueId: string) => {
    const response = await axiosInstance.get(`/issues/${issueId}/email_thread/`);
    return response;
  },

  generateAIReply: async (issueId: string, vendorMessage: string) => {
    const response = await axiosInstance.post(`/issues/${issueId}/generate_ai_reply/`, {
      vendor_message: vendorMessage
    });
    return response;
  },

  addVendorResponse: async (issueId: string, data: {
    message: string;
    subject?: string;
    from_email?: string;
  }) => {
    const response = await axiosInstance.post(`/issues/${issueId}/add_vendor_response/`, data);
    return response;
  },

  analyzeVendorResponse: async (issueId: string, message: string) => {
    const response = await axiosInstance.post(`/issues/${issueId}/analyze_vendor_response/`, {
      message
    });
    return response;
  },

  // New AI Email Automation endpoints
  getConversation: async (issueId: string) => {
    const response = await axiosInstance.get(`/issues/${issueId}/conversation/`);
    return response.data;
  },

  getSummary: async (issueId: string) => {
    const response = await axiosInstance.get(`/issues/${issueId}/summary/`);
    return response.data;
  },

  sendManualMessage: async (issueId: string, data: {
    subject?: string;
    message: string;
    to_email?: string;
  }) => {
    const response = await axiosInstance.post(`/issues/${issueId}/send_manual_message/`, data);
    return response.data;
  },

  // Bulk Email endpoint
  sendBulkEmail: async (data: {
    issue_ids: string[];
    subject: string;
    message: string;
    include_issue_details?: boolean;
    include_photos?: boolean;
  }) => {
    const response = await axiosInstance.post('/issues/bulk-email/', data);
    return response.data;
  },
};

export default issueApi;
