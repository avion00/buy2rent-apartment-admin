import { API_BASE_URL } from './config';

export interface ImportResponse {
  success: boolean;
  message: string;
  data?: {
    total_products: number;
    successful_imports: number;
    failed_imports: number;
    sheets_processed: number;
    errors: string[];
  };
  errors?: string[];
}

export interface ProductCategory {
  id: string;
  name: string;
  apartment: string;
  apartment_name: string;
  import_file_name: string;
  import_date: string;
  sheet_name: string;
  description: string;
  room_type: string;
  priority: number;
  is_active: boolean;
  product_count: number;
  created_at: string;
  updated_at: string;
}

export interface ImportSession {
  id: string;
  apartment: string;
  apartment_name: string;
  file_name: string;
  file_size: number;
  file_type: string;
  total_sheets: number;
  total_products: number;
  successful_imports: number;
  failed_imports: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_log: any[];
  started_at: string;
  completed_at: string | null;
  duration: number | null;
}

export interface Product {
  id: string;
  apartment: string;
  category: string | null;
  category_details: {
    id: string;
    name: string;
    sheet_name: string;
    room_type: string;
  } | null;
  category_name: string | null;
  import_session: string | null;
  product: string;
  description: string;
  vendor: string | null;
  vendor_name: string | null;
  sku: string;
  unit_price: number;
  qty: number;
  
  // Excel Import Fields - All columns from your Excel files
  sn: string;
  room: string;
  product_image: string;
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
  
  // Standard fields
  dimensions: string;
  weight: string;
  material: string;
  color: string;
  model_number: string;
  brand: string;
  image_url: string;
  image_file: string | null;
  thumbnail_url: string;
  gallery_images: string[];
  
  // Frontend compatibility fields (camelCase)
  imageUrl?: string;
  
  // Status and dates
  status: string;
  payment_status: string;
  expected_delivery_date: string | null;
  actual_delivery_date: string | null;
  issue_state: string;
  
  created_at: string;
  updated_at: string;
}

// Base API class with common functionality
class BaseApiService {
  protected getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  protected getMultipartHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  protected async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(`API Error: ${response.status} ${response.statusText}`);
      (error as any).status = response.status;
      (error as any).data = errorData;
      throw error;
    }
    return response.json();
  }

  protected async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  protected async post<T>(endpoint: string, data: any, isFormData = false): Promise<T> {
    const headers = isFormData ? this.getMultipartHeaders() : this.getAuthHeaders();
    const body = isFormData ? data : JSON.stringify(data);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body,
    });

    return this.handleResponse<T>(response);
  }

  protected async deleteRequest<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (response.status === 204) {
      return {} as T; // No content response
    }

    return this.handleResponse<T>(response);
  }

  protected async getBlob(endpoint: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.blob();
  }
}

class ImportApiService extends BaseApiService {
  /**
   * Import products from Excel/CSV file
   */
  async importProducts(apartmentId: string, file: File): Promise<ImportResponse> {
    const formData = new FormData();
    formData.append('apartment_id', apartmentId);
    formData.append('file', file);

    return this.post<ImportResponse>('/api/products/import_excel/', formData, true);
  }

  /**
   * Create apartment and import products in one operation
   */
  async createApartmentAndImport(apartmentData: {
    apartment_name: string;
    apartment_type?: string;
    owner?: string;
    status?: string;
    designer?: string;
    start_date?: string;
    due_date?: string;
    address?: string;
  }, file: File): Promise<ImportResponse & { apartment_id: string; apartment_name: string }> {
    const formData = new FormData();
    
    // Add apartment data
    formData.append('apartment_name', apartmentData.apartment_name);
    if (apartmentData.apartment_type) formData.append('apartment_type', apartmentData.apartment_type);
    if (apartmentData.owner) formData.append('owner', apartmentData.owner);
    if (apartmentData.status) formData.append('status', apartmentData.status);
    if (apartmentData.designer) formData.append('designer', apartmentData.designer);
    if (apartmentData.start_date) formData.append('start_date', apartmentData.start_date);
    if (apartmentData.due_date) formData.append('due_date', apartmentData.due_date);
    if (apartmentData.address) formData.append('address', apartmentData.address);
    
    // Add file
    formData.append('file', file);

    return this.post<ImportResponse & { apartment_id: string; apartment_name: string }>('/api/products/create_apartment_and_import/', formData, true);
  }

  /**
   * Get product categories for an apartment
   */
  async getProductCategories(apartmentId: string): Promise<ProductCategory[]> {
    return this.get<ProductCategory[]>(`/api/products/categories/${apartmentId}/`);
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(categoryId: string): Promise<{
    category: ProductCategory;
    products: Product[];
  }> {
    return this.get<{
      category: ProductCategory;
      products: Product[];
    }>(`/api/products/categories/${categoryId}/products/`);
  }

  /**
   * Get all products for an apartment
   */
  async getProductsByApartment(apartmentId: string): Promise<Product[]> {
    return this.get<Product[]>(`/api/products/?apartment=${apartmentId}`);
  }

  /**
   * Get import sessions for an apartment
   */
  async getImportSessions(apartmentId: string): Promise<ImportSession[]> {
    return this.get<ImportSession[]>(`/api/products/import-sessions/${apartmentId}/`);
  }

  /**
   * Delete an import session
   */
  async deleteImportSession(sessionId: string): Promise<{ message: string }> {
    return this.deleteRequest<{ message: string }>(`/api/products/import-sessions/${sessionId}/delete/`);
  }

  /**
   * Download import template
   */
  async downloadTemplate(): Promise<Blob> {
    return this.getBlob('/api/products/import/template/');
  }

  /**
   * Upload file with progress tracking
   */
  async importProductsWithProgress(
    apartmentId: string, 
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ImportResponse> {
    const formData = new FormData();
    formData.append('apartment_id', apartmentId);
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded * 100) / event.total);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid JSON response'));
          }
        } else {
          reject(new Error(`HTTP Error: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error'));
      });

      const token = localStorage.getItem('access_token');
      xhr.open('POST', `${API_BASE_URL}/api/products/import/`);
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      
      xhr.send(formData);
    });
  }
}

export const importApi = new ImportApiService();
