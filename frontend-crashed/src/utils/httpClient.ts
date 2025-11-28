// HTTP Client with automatic JWT token refresh
class HttpClient {
  private baseURL: string;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor(baseURL: string = 'http://localhost:8000') {
    this.baseURL = baseURL;
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  private async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseURL}/auth/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      // Refresh token is invalid, clear storage and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Dispatch custom event to notify AuthContext
      window.dispatchEvent(new CustomEvent('auth:token-expired'));
      
      throw new Error('Refresh token expired');
    }

    const data = await response.json();
    const newAccessToken = data.access;
    
    // Update stored access token
    localStorage.setItem('access_token', newAccessToken);
    
    // If refresh token rotation is enabled, update refresh token too
    if (data.refresh) {
      localStorage.setItem('refresh_token', data.refresh);
    }

    return newAccessToken;
  }

  async request(url: string, options: RequestInit = {}): Promise<Response> {
    const accessToken = localStorage.getItem('access_token');
    
    // Add authorization header if token exists
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const requestOptions: RequestInit = {
      ...options,
      headers,
    };

    // Make the initial request
    let response = await fetch(`${this.baseURL}${url}`, requestOptions);

    // If we get a 401 and have a refresh token, try to refresh
    if (response.status === 401 && accessToken) {
      if (this.isRefreshing) {
        // If we're already refreshing, queue this request
        return new Promise((resolve, reject) => {
          this.failedQueue.push({ resolve, reject });
        }).then(() => {
          // Retry the request with new token
          const newToken = localStorage.getItem('access_token');
          if (newToken) {
            requestOptions.headers = {
              ...requestOptions.headers,
              'Authorization': `Bearer ${newToken}`,
            };
          }
          return fetch(`${this.baseURL}${url}`, requestOptions);
        });
      }

      this.isRefreshing = true;

      try {
        const newToken = await this.refreshToken();
        
        // Process queued requests
        this.processQueue(null, newToken);
        
        // Retry the original request with new token
        requestOptions.headers = {
          ...requestOptions.headers,
          'Authorization': `Bearer ${newToken}`,
        };
        
        response = await fetch(`${this.baseURL}${url}`, requestOptions);
      } catch (error) {
        // Refresh failed, process queue with error
        this.processQueue(error, null);
        throw error;
      } finally {
        this.isRefreshing = false;
      }
    }

    return response;
  }

  // Convenience methods
  async get(url: string, options: RequestInit = {}): Promise<Response> {
    return this.request(url, { ...options, method: 'GET' });
  }

  async post(url: string, data?: any, options: RequestInit = {}): Promise<Response> {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async postMultipart(url: string, formData: FormData, options: RequestInit = {}): Promise<Response> {
    const accessToken = localStorage.getItem('access_token');
    
    // For multipart, don't set Content-Type - browser will set it with boundary
    const headers: any = {
      ...options.headers,
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const requestOptions: RequestInit = {
      ...options,
      method: 'POST',
      headers,
      body: formData,
    };

    return fetch(`${this.baseURL}${url}`, requestOptions);
  }

  async put(url: string, data?: any, options: RequestInit = {}): Promise<Response> {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch(url: string, data?: any, options: RequestInit = {}): Promise<Response> {
    return this.request(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(url: string, options: RequestInit = {}): Promise<Response> {
    return this.request(url, { ...options, method: 'DELETE' });
  }
}

// Create and export a singleton instance
export const httpClient = new HttpClient();
export default httpClient;
