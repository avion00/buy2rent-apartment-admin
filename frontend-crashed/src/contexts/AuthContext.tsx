import React, { createContext, useContext, useState, useEffect } from 'react';
import { httpClient } from '../utils/httpClient';
import { tokenManager } from '../utils/tokenManager';

interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData | any) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
  refreshToken: () => Promise<void>;
}

interface SignupData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone?: string;
  password: string;
  password_confirm: string;
}

// API Configuration
const API_BASE_URL = 'http://localhost:8000';
const API_ENDPOINTS = {
  login: `${API_BASE_URL}/auth/login/`,
  register: `${API_BASE_URL}/auth/register/`,
  refresh: `${API_BASE_URL}/auth/refresh/`,
  profile: `${API_BASE_URL}/auth/profile/`,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    checkAuth();
    
    // Listen for token expiration events
    const handleTokenExpired = () => {
      console.log('🔄 Token expired, logging out user');
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      tokenManager.stopMonitoring();
    };

    // Listen for successful token refresh events
    const handleTokenRefreshed = (event: CustomEvent) => {
      console.log('✅ Token refreshed, updating user session');
      // Token was refreshed successfully, user session continues
    };

    window.addEventListener('auth:token-expired', handleTokenExpired);
    window.addEventListener('auth:token-refreshed', handleTokenRefreshed as EventListener);
    
    return () => {
      window.removeEventListener('auth:token-expired', handleTokenExpired);
      window.removeEventListener('auth:token-refreshed', handleTokenRefreshed as EventListener);
    };
  }, []);

  const checkAuth = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        // Use HTTP client which handles automatic token refresh
        const response = await httpClient.get('/auth/profile/');
        
        if (response.ok) {
          const userData = await response.json();
          console.log('✅ AuthContext: User data loaded:', userData);
          setUser(userData);
          
          // Start token monitoring for existing session
          tokenManager.startMonitoring();
        } else {
          // If still fails after potential refresh, clear storage
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          tokenManager.stopMonitoring();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refresh_token');
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(API_ENDPOINTS.refresh, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshTokenValue })
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      
      // If refresh token rotation is enabled, update refresh token
      if (data.refresh) {
        localStorage.setItem('refresh_token', data.refresh);
      }
      
      // Get updated user profile using HTTP client
      const profileResponse = await httpClient.get('/auth/profile/');

      if (profileResponse.ok) {
        const userData = await profileResponse.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await httpClient.post('/auth/login/', { email, password });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Use the user-friendly error message from backend
        const errorMessage = errorData.message || errorData.detail || 'Login failed';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Store tokens (backend now returns 'access' and 'refresh')
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      
      // Set user data
      console.log('✅ Login: User data received:', data.user);
      setUser(data.user);
      
      // Start token monitoring after successful login
      tokenManager.startMonitoring();
    } catch (error) {
      throw error;
    }
  };

  const signup = async (userData: SignupData | any) => {
    try {
      // Ensure all required fields are present
      const signupData: SignupData = {
        email: userData.email || '',
        username: userData.username || '',
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        phone: userData.phone || '',
        password: userData.password || '',
        password_confirm: userData.password_confirm || '',
      };

      const response = await httpClient.post('/auth/register/', signupData);

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle validation errors
        if (errorData.errors) {
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          throw new Error(errorMessages);
        }
        
        throw new Error(errorData.message || errorData.detail || 'Registration failed');
      }

      const data = await response.json();
      
      // Store tokens (registration returns tokens immediately)
      if (data.tokens) {
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
      }
      
      // Set user data
      setUser(data.user);
      
      // Start token monitoring after successful signup
      tokenManager.startMonitoring();
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Stop token monitoring
      tokenManager.stopMonitoring();
      
      // Clear tokens and user state
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/password-reset/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.detail || 'Password reset failed');
      }
      
      const data = await response.json();
      return data; // Return success message
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        resetPassword,
        refreshToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
