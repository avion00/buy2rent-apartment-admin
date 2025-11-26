import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, tokenManager, type UserProfile } from '@/services/authApi';

interface User {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  name?: string; // Computed field
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  loginWithTwitter: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = tokenManager.getAccessToken();
      if (token) {
        // Validate token and get user profile
        const profile = await authApi.getProfile();
        setUser({
          ...profile,
          name: profile.first_name && profile.last_name 
            ? `${profile.first_name} ${profile.last_name}`
            : profile.username,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      tokenManager.clearTokens();
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const profile = await authApi.getProfile();
      setUser({
        ...profile,
        name: profile.first_name && profile.last_name 
          ? `${profile.first_name} ${profile.last_name}`
          : profile.username,
      });
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Backend uses email field
      const response = await authApi.login({
        email,
        password,
      });

      // Store tokens
      tokenManager.setTokens(response.access, response.refresh);

      // Set user data
      setUser({
        ...response.user,
        name: response.user.first_name && response.user.last_name
          ? `${response.user.first_name} ${response.user.last_name}`
          : response.user.username,
      });
    } catch (error: any) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.detail 
        || error.response?.data?.error
        || error.message 
        || 'Login failed';
      throw new Error(errorMessage);
    }
  };

  const signup = async (email: string, password: string, name?: string) => {
    try {
      // Parse name into first_name and last_name
      const nameParts = name?.split(' ') || [];
      const first_name = nameParts[0] || 'User';
      const last_name = nameParts.slice(1).join(' ') || 'Name';

      const response = await authApi.register({
        username: email.split('@')[0], // Use email prefix as username
        email,
        password,
        password_confirm: password, // Backend requires password confirmation
        first_name,
        last_name,
      });

      // Store tokens
      tokenManager.setTokens(response.access, response.refresh);

      // Set user data
      setUser({
        ...response.user,
        name: response.user.first_name && response.user.last_name
          ? `${response.user.first_name} ${response.user.last_name}`
          : response.user.username,
      });
    } catch (error: any) {
      console.error('Signup failed:', error);
      // Extract validation errors if present
      const errors = error.response?.data?.details || error.response?.data?.errors;
      let errorMessage = error.response?.data?.message 
        || error.response?.data?.detail 
        || error.response?.data?.error
        || error.message 
        || 'Signup failed';
      
      // If there are field-specific errors, show the first one
      if (errors && typeof errors === 'object') {
        const firstError = Object.values(errors)[0];
        if (Array.isArray(firstError)) {
          errorMessage = firstError[0];
        } else if (typeof firstError === 'string') {
          errorMessage = firstError;
        }
      }
      
      throw new Error(errorMessage);
    }
  };

  const loginWithGoogle = async () => {
    try {
      // TODO: Implement Google OAuth flow
      window.location.href = '/api/auth/google';
    } catch (error) {
      throw error;
    }
  };

  const loginWithFacebook = async () => {
    try {
      // TODO: Implement Facebook OAuth flow
      window.location.href = '/api/auth/facebook';
    } catch (error) {
      throw error;
    }
  };

  const loginWithTwitter = async () => {
    try {
      // TODO: Implement Twitter OAuth flow
      window.location.href = '/api/auth/twitter';
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
      tokenManager.clearTokens();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear tokens anyway
      tokenManager.clearTokens();
      setUser(null);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await authApi.requestPasswordReset({ email });
    } catch (error: any) {
      console.error('Password reset failed:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Password reset failed');
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      // Email verification endpoint not in backend API yet
      // This is a placeholder for future implementation
      console.warn('Email verification not implemented yet');
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
        loginWithGoogle,
        loginWithFacebook,
        loginWithTwitter,
        logout,
        resetPassword,
        verifyEmail,
        refreshUser,
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
