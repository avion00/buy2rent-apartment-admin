// Centralized API configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const AUTH_BASE_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:8000/auth';

// Log the current API URLs for debugging
console.log('API Configuration:', {
  API_BASE_URL,
  AUTH_BASE_URL,
  mode: import.meta.env.MODE
});
