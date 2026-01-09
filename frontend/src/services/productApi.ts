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
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Category type definition
export interface Category {
  id: string;
  name: string;
  sheet_name: string;
  room_type: string;
}

// Vendor type definition
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
  product_categories: string;
  certifications: string;
  specializations: string;
  payment_terms: string;
  delivery_terms: string;
  warranty_period: string;
  return_policy: string;
  minimum_order: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

// Order status info type
export interface OrderStatusInfo {
  status: string;
  po_number: string;
  order_id: string;
  placed_on: string | null;
  quantity: number;
  expected_delivery: string | null;
  shipping_address: string | null;
}

// Delivery status info type
export interface DeliveryStatusInfo {
  status: string;
  order_reference: string;
  tracking_number: string | null;
  expected_date: string | null;
  actual_date: string | null;
  location: string | null;
}

// Issue status info type
export interface IssueStatusInfo {
  status: string;
  priority: string | null;
  type: string | null;
  issue_id: string | null;
  created_at: string | null;
}

// Product type definition
export interface Product {
  id: string;
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
  category: string;
  category_details: Category;
  category_name: string;
  import_session: string | null;
  product: string;
  description: string;
  vendor: string;
  vendor_details: Vendor;
  vendor_name: string;
  vendor_link: string;
  sku: string;
  unit_price: string;
  qty: number;
  availability: string;
  status: string[];
  dimensions: string;
  weight: string;
  material: string;
  color: string;
  model_number: string;
  sn: string;
  product_image: string; // Primary image field - used for all image operations
  cost: string;
  total_cost: string;
  link: string;
  size: string;
  nm: string;
  plusz_nm: string;
  price_per_nm: string;
  price_per_package: string;
  nm_per_package: string;
  all_package: string;
  package_need_to_order: string;
  all_price: string;
  eta: string | null;
  ordered_on: string | null;
  expected_delivery_date: string | null;
  actual_delivery_date: string | null;
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
  delivery_type: string;
  delivery_address: string;
  delivery_city: string;
  delivery_postal_code: string;
  delivery_country: string;
  delivery_instructions: string;
  delivery_contact_person: string;
  delivery_contact_phone: string;
  delivery_contact_email: string;
  delivery_time_window: string;
  delivery_notes: string;
  tracking_number: string;
  condition_on_arrival: string;
  issue_state: string;
  issue_type: string;
  issue_description: string;
  replacement_requested: boolean;
  replacement_approved: boolean;
  replacement_eta: string | null;
  replacement_of: string | null;
  thumbnail_url: string;
  gallery_images: string[];
  attachments: string[];
  import_row_number: number | null;
  import_data: Record<string, any>;
  notes: string;
  manual_notes: string;
  ai_summary_notes: string;
  status_tags: string[];
  delivery_status_tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  // Order tracking fields
  order_status_info: OrderStatusInfo[];
  has_active_order: boolean;
  is_ordered: boolean;
  delivery_status_info: DeliveryStatusInfo[];
  payment_status_from_orders: string;
  issue_status_info: IssueStatusInfo;
}

// Product form data for creating/updating
export interface ProductFormData {
  apartment: string;
  category: string;
  product: string;
  description?: string;
  vendor: string;
  vendor_link?: string;
  sku?: string;
  unit_price: string;
  qty: number;
  availability?: string;
  status: string[];
  room?: string;
  link?: string;
  eta?: string | null;
  ordered_on?: string | null;
  expected_delivery_date?: string | null;
  actual_delivery_date?: string | null;
  payment_status?: string;
  payment_due_date?: string | null;
  payment_amount?: string | null;
  paid_amount?: string;
  currency?: string;
  delivery_type?: string;
  issue_state?: string;
  notes?: string;
}

// API response types
export interface ProductListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export interface CategoryListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Category[];
}

// Product API functions
export const productApi = {
  // Get all products (with optional filters)
  getProducts: async (params?: {
    search?: string;
    apartment?: string;
    category?: string;
    status?: string;
    vendor?: string;
    page?: number;
    page_size?: number;
    ordering?: string;
  }): Promise<ProductListResponse> => {
    const response = await axiosInstance.get('/products/', { params });
    return response.data;
  },

  // Get products by apartment
  getProductsByApartment: async (apartmentId: string, params?: {
    search?: string;
    category?: string;
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<Product[]> => {
    const response = await axiosInstance.get(`/products/by_apartment/`, {
      params: { apartment_id: apartmentId, ...params }
    });
    // API returns array directly, not paginated response
    return response.data;
  },

  // Get products by category
  getProductsByCategory: async (params?: {
    apartment?: string;
    category?: string;
    page?: number;
    page_size?: number;
  }): Promise<ProductListResponse> => {
    const response = await axiosInstance.get('/products/by_category/', { params });
    return response.data;
  },

  // Get single product
  getProduct: async (id: string): Promise<Product> => {
    const response = await axiosInstance.get(`/products/${id}/`);
    return response.data;
  },

  // Create product
  createProduct: async (data: ProductFormData | FormData): Promise<Product> => {
    // For FormData, don't set Content-Type - let browser set it with boundary
    const config = data instanceof FormData ? {
      headers: {
        'Content-Type': undefined, // Let browser set multipart/form-data with boundary
      },
    } : {};
    
    const response = await axiosInstance.post('/products/', data, config);
    return response.data;
  },

  // Update product (PATCH)
  updateProduct: async (id: string, data: Partial<ProductFormData> | FormData): Promise<Product> => {
    // For FormData, don't set Content-Type - let browser set it with boundary
    const config = data instanceof FormData ? {
      headers: {
        'Content-Type': undefined, // Let browser set multipart/form-data with boundary
      },
    } : {};
    
    const response = await axiosInstance.patch(`/products/${id}/`, data, config);
    return response.data;
  },

  // Delete product
  deleteProduct: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/products/${id}/`);
  },

  // Get product categories for an apartment
  getProductCategories: async (apartmentId: string): Promise<Category[]> => {
    const response = await axiosInstance.get('/products/categories/', {
      params: { apartment_id: apartmentId }
    });
    return response.data;
  },

  // Create a new product category
  createCategory: async (data: { name: string; apartment: string; sheet_name?: string; description?: string }): Promise<Category> => {
    const response = await axiosInstance.post('/products/create_category/', {
      ...data,
      sheet_name: data.sheet_name || data.name,
    });
    return response.data;
  },

  // Import products from Excel/CSV
  importProducts: async (file: File, apartmentId: string, vendorId: string): Promise<any> => {
    console.log("🔍 DEBUG productApi: Received parameters:", { file: file.name, apartmentId, vendorId });
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('apartment_id', apartmentId);
    formData.append('vendor_id', vendorId);
    
    console.log("🔍 DEBUG productApi: FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }
    
    const response = await axiosInstance.post('/products/import_excel/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get import sessions for an apartment
  getImportSessions: async (apartmentId: string): Promise<any> => {
    const response = await axiosInstance.get('/products/import_sessions/', {
      params: { apartment: apartmentId }
    });
    return response.data;
  },

  // Delete import session
  deleteImportSession: async (sessionId: string): Promise<void> => {
    await axiosInstance.delete(`/products/delete_import_session/${sessionId}/`);
  },

  // Download import template
  downloadImportTemplate: async (): Promise<Blob> => {
    const response = await axiosInstance.get('/products/import_template/', {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get product statistics
  getProductStatistics: async (apartmentId?: string): Promise<any> => {
    const response = await axiosInstance.get('/products/statistics/', {
      params: apartmentId ? { apartment: apartmentId } : undefined
    });
    return response.data;
  },

  // Create apartment and import products in one operation
  createApartmentAndImport: async (data: {
    file: File;
    apartment_name: string;
    apartment_type?: string;
    owner?: string;
    status?: string;
    designer?: string;
    start_date?: string;
    due_date?: string;
    address?: string;
    vendor_id?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: {
      apartment_id: string;
      apartment_name: string;
      total_products: number;
      successful_imports: number;
      failed_imports: number;
      sheets_processed: number;
      errors: string[];
    };
  }> => {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('apartment_name', data.apartment_name);
    
    if (data.apartment_type) formData.append('apartment_type', data.apartment_type);
    if (data.owner) formData.append('owner', data.owner);
    if (data.status) formData.append('status', data.status);
    if (data.designer) formData.append('designer', data.designer);
    if (data.start_date) formData.append('start_date', data.start_date);
    if (data.due_date) formData.append('due_date', data.due_date);
    if (data.address) formData.append('address', data.address);
    if (data.vendor_id) formData.append('vendor_id', data.vendor_id);
    
    const response = await axiosInstance.post('/products/create_apartment_and_import/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
