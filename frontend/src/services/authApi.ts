import axios, { AxiosInstance } from 'axios';

const AUTH_BASE_URL = 'http://localhost:8000/auth';

// Create axios instance for auth requests
const authAxios: AxiosInstance = axios.create({
  baseURL: AUTH_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple refresh requests
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

// Response interceptor for automatic token refresh
authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return authAxios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenManager.getRefreshToken();

      if (!refreshToken) {
        // No refresh token, redirect to login
        tokenManager.clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the token
        const response = await authAxios.post('/refresh/', {
          refresh: refreshToken,
        });

        const { access } = response.data;

        // Update access token
        const currentRefresh = tokenManager.getRefreshToken();
        if (currentRefresh) {
          tokenManager.setTokens(access, currentRefresh);
        }

        // Update authorization header
        originalRequest.headers.Authorization = `Bearer ${access}`;

        // Process queued requests
        processQueue();

        // Retry original request
        return authAxios(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        processQueue(refreshError);
        tokenManager.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth API types
export interface LoginRequest {
  email: string;  // Backend uses email field
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: string;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface RefreshResponse {
  access: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  date_joined?: string;
  last_login?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface Session {
  session_id: string;
  user_agent: string;
  ip_address: string;
  last_activity: string;
  created_at: string;
}

// Auth API service
export const authApi = {
  // Login with JWT Token
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await authAxios.post<LoginResponse>('/login/', credentials);
    return response.data;
  },

  // Register new user
  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await authAxios.post('/register/', data);
    // Backend returns { success, message, user, tokens: { access, refresh } }
    // Transform to match LoginResponse format
    const responseData = response.data;
    return {
      access: responseData.tokens.access,
      refresh: responseData.tokens.refresh,
      user: responseData.user,
    };
  },

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<RefreshResponse> {
    const response = await authAxios.post<RefreshResponse>('/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },

  // Logout
  async logout(refreshToken: string): Promise<void> {
    const token = localStorage.getItem('access_token');
    await authAxios.post(
      '/logout/',
      { refresh: refreshToken },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
  },

  // Get user profile
  async getProfile(): Promise<UserProfile> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found');
    }

    const response = await authAxios.get<UserProfile>('/profile/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Update user profile
  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found');
    }

    const response = await authAxios.put<UserProfile>('/profile/', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Request password reset
  async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    await authAxios.post('/password-reset/', data);
  },

  // Confirm password reset
  async confirmPasswordReset(data: PasswordResetConfirm): Promise<void> {
    await authAxios.post('/password-reset-confirm/', data);
  },

  // Change password (when logged in)
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found');
    }

    await authAxios.post('/change-password/', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Get user sessions
  async getSessions(): Promise<Session[]> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found');
    }

    const response = await authAxios.get<Session[]>('/sessions/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Terminate a specific session
  async terminateSession(sessionId: string): Promise<void> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found');
    }

    await authAxios.delete(`/sessions/${sessionId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Terminate all sessions
  async terminateAllSessions(): Promise<void> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found');
    }

    await authAxios.delete('/sessions/', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

// Helper functions for token management
export const tokenManager = {
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  },

  setTokens(access: string, refresh: string): void {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  },

  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },
};
