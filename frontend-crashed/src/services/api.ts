import httpClient from '@/utils/httpClient';

// Base API Service class with common methods
class BaseApiService {
  protected async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await httpClient.get(`${endpoint}${queryString}`);
    return this.handleResponse<T>(response);
  }

  protected async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await httpClient.post(endpoint, data);
    return this.handleResponse<T>(response);
  }

  protected async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await httpClient.patch(endpoint, data);
    return this.handleResponse<T>(response);
  }

  protected async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await httpClient.put(endpoint, data);
    return this.handleResponse<T>(response);
  }

  protected async deleteRequest(endpoint: string): Promise<void> {
    const response = await httpClient.delete(endpoint);
    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }
  }

  protected async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorData.detail || errorData.message || 'Request failed');
    }
    return response.json();
  }
}

// Client API
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type: string; // Client type (Investor, Buy2Rent Internal)
  account_status: string; // Account status (Active, Inactive)
  notes?: string; // Additional notes
  created_at: string;
  updated_at: string;
}

class ClientApiService extends BaseApiService {
  async getAll(params?: { search?: string; type?: string; account_status?: string }): Promise<Client[]> {
    return this.get<Client[]>('/api/clients/', params);
  }

  async getById(id: string): Promise<Client> {
    return this.get<Client>(`/api/clients/${id}/`);
  }

  async create(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
    return this.post<Client>('/api/clients/', client);
  }

  async update(id: string, client: Partial<Client>): Promise<Client> {
    return this.patch<Client>(`/api/clients/${id}/`, client);
  }

  async delete(id: string): Promise<void> {
    return this.deleteRequest(`/api/clients/${id}/`);
  }
}

// Apartment API
export interface Apartment {
  id: string;
  name: string;
  client?: string;
  client_details?: Client;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  size_sqm?: number;
  rooms?: number;
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold';
  budget?: string;
  start_date?: string;
  expected_completion_date?: string;
  actual_completion_date?: string;
  notes?: string;
  type?: string; // Type of apartment (furnishing, renovating, etc.)
  progress?: number; // Progress percentage
  designer?: string; // Designer name
  due_date?: string; // Due date
  created_at: string;
  updated_at: string;
}

class ApartmentApiService extends BaseApiService {
  async getAll(params?: { type?: string; status?: string; client?: string; search?: string; ordering?: string }): Promise<Apartment[]> {
    return this.get<Apartment[]>('/api/apartments/', params);
  }

  async getById(id: string): Promise<Apartment> {
    return this.get<Apartment>(`/api/apartments/${id}/`);
  }

  async create(apartment: Omit<Apartment, 'id' | 'created_at' | 'updated_at' | 'client_details'>): Promise<Apartment> {
    return this.post<Apartment>('/api/apartments/', apartment);
  }

  async update(id: string, apartment: Partial<Apartment>): Promise<Apartment> {
    return this.patch<Apartment>(`/api/apartments/${id}/`, apartment);
  }

  async delete(id: string): Promise<void> {
    return this.deleteRequest(`/api/apartments/${id}/`);
  }
}

// Vendor API
export interface Vendor {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  category?: string;
  rating?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

class VendorApiService extends BaseApiService {
  async getAll(): Promise<Vendor[]> {
    return this.get<Vendor[]>('/api/vendors/');
  }

  async getById(id: string): Promise<Vendor> {
    return this.get<Vendor>(`/api/vendors/${id}/`);
  }

  async create(vendor: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>): Promise<Vendor> {
    return this.post<Vendor>('/api/vendors/', vendor);
  }

  async update(id: string, vendor: Partial<Vendor>): Promise<Vendor> {
    return this.patch<Vendor>(`/api/vendors/${id}/`, vendor);
  }

  async delete(id: string): Promise<void> {
    return this.deleteRequest(`/api/vendors/${id}/`);
  }
}

// Product Category API
export interface ProductCategory {
  id: string;
  name: string;
  apartment: string;
  apartment_name?: string;
  import_file_name?: string;
  import_date?: string;
  sheet_name: string;
  description?: string;
  room_type?: string;
  priority: number;
  is_active: boolean;
  product_count?: number;
  created_at: string;
  updated_at: string;
}

// Product API
export interface Product {
  id: string;
  apartment: string;
  apartment_details?: Apartment;
  vendor: string;
  vendor_details?: Vendor;
  vendor_name?: string;
  product: string;
  vendor_link?: string;
  sku: string;
  unit_price: string; // Changed to string to match API response
  qty: number;
  availability: 'In Stock' | 'Backorder' | 'Out of Stock';
  status: string;
  eta?: string;
  ordered_on?: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  category?: string;
  category_name?: string; // Added missing field
  category_details?: {
    id: string;
    name: string;
    sheet_name: string;
    room_type: string;
  };
  room?: string;
  brand?: string;
  country_of_origin?: string;
  payment_status: 'Unpaid' | 'Partially Paid' | 'Paid';
  payment_due_date?: string;
  payment_amount?: number;
  paid_amount: string; // Changed to string to match API response
  currency: string;
  shipping_cost: string; // Changed to string to match API response
  discount: string; // Changed to string to match API response
  total_amount: string; // Changed to string to match API response
  outstanding_balance: string; // Changed to string to match API response
  delivery_type?: string;
  delivery_address?: string;
  delivery_city?: string;
  delivery_postal_code?: string;
  delivery_country?: string;
  delivery_instructions?: string;
  delivery_contact_person?: string;
  delivery_contact_phone?: string;
  delivery_contact_email?: string;
  delivery_time_window?: string;
  delivery_notes?: string;
  tracking_number?: string;
  condition_on_arrival?: string;
  issue_state: string;
  issue_type?: string;
  issue_description?: string;
  replacement_requested: boolean;
  replacement_approved: boolean;
  replacement_eta?: string;
  replacement_of?: string;
  image_url?: string;
  image_file?: string;
  product_image?: string;
  imageUrl?: string; // Computed field from backend serializer (includes image_file.url)
  thumbnail_url?: string;
  gallery_images?: any[];
  attachments?: any[];
  notes?: string;
  manual_notes?: string;
  ai_summary_notes?: string;
  status_tags?: string[];
  delivery_status_tags?: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Excel import fields
  sn?: string;
  cost?: string;
  total_cost?: string;
  link?: string;
  size?: string;
  nm?: string;
  plusz_nm?: string;
  price_per_nm?: string;
  price_per_package?: string;
  nm_per_package?: string;
  all_package?: string;
  package_need_to_order?: string;
  all_price?: string;
  description?: string;
  dimensions?: string;
  weight?: string;
  material?: string;
  color?: string;
  model_number?: string;
  import_session?: string;
  import_row_number?: number;
  import_data?: any;
}

class ProductApiService extends BaseApiService {
  async getAll(params?: { 
    apartment?: string; 
    vendor?: string;
    status?: string;
    payment_status?: string;
    issue_state?: string;
  }): Promise<Product[]> {
    return this.get<Product[]>('/api/products/', params);
  }

  async getById(id: string): Promise<Product> {
    return this.get<Product>(`/api/products/${id}/`);
  }

  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'apartment_details' | 'vendor_details' | 'vendor_name' | 'total_amount' | 'outstanding_balance' | 'status_tags' | 'delivery_status_tags'>): Promise<Product> {
    return this.post<Product>('/api/products/', product);
  }

  async createWithImage(product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'apartment_details' | 'vendor_details' | 'vendor_name' | 'total_amount' | 'outstanding_balance' | 'status_tags' | 'delivery_status_tags'>, imageFile?: File): Promise<Product> {
    const formData = new FormData();
    
    // Add all product fields to FormData
    Object.entries(product).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        // Handle arrays and objects
        if (Array.isArray(value) || typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });
    
    // Add image file if provided
    if (imageFile) {
      formData.append('image_file', imageFile);
    }
    
    const response = await httpClient.postMultipart('/api/products/', formData);
    return this.handleResponse<Product>(response);
  }

  async update(id: string, product: Partial<Product>): Promise<Product> {
    return this.patch<Product>(`/api/products/${id}/`, product);
  }

  async delete(id: string): Promise<void> {
    return this.deleteRequest(`/api/products/${id}/`);
  }

  async getCategories(params: { apartment_id: string }): Promise<ProductCategory[]> {
    return this.get<ProductCategory[]>('/api/products/categories/', params);
  }
}

// Export API service instances
export const clientApi = new ClientApiService();
export const apartmentApi = new ApartmentApiService();
export const vendorApi = new VendorApiService();
export const productApi = new ProductApiService();
