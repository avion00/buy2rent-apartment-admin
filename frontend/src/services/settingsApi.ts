import axios from 'axios';

// Auth endpoints are at /auth/ not /api/auth/
const AUTH_BASE_URL = 'http://localhost:8000';

const authAxios = axios.create({
  baseURL: AUTH_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
authAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
authAxios.interceptors.response.use(
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

// Types
export interface UserSettings {
  id: string;
  user_email: string;
  user_name: string;
  // Profile
  company: string;
  job_title: string;
  // Notification Channels
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  // Notification Activity
  order_updates: boolean;
  payment_alerts: boolean;
  delivery_notifications: boolean;
  vendor_messages: boolean;
  system_alerts: boolean;
  // Notification Reports
  weekly_reports: boolean;
  monthly_reports: boolean;
  // Notification Sound & Desktop
  sound_enabled: boolean;
  desktop_notifications: boolean;
  // Display
  theme: 'light' | 'dark' | 'system';
  compact_view: boolean;
  sidebar_collapsed: boolean;
  show_avatars: boolean;
  animations_enabled: boolean;
  // Regional
  language: string;
  timezone: string;
  date_format: string;
  time_format: string;
  currency: string;
  number_format: string;
  // Security
  two_factor_enabled: boolean;
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  order_updates: boolean;
  payment_alerts: boolean;
  delivery_notifications: boolean;
  vendor_messages: boolean;
  system_alerts: boolean;
  weekly_reports: boolean;
  monthly_reports: boolean;
  sound_enabled: boolean;
  desktop_notifications: boolean;
}

export interface DisplaySettings {
  theme: 'light' | 'dark' | 'system';
  compact_view: boolean;
  sidebar_collapsed: boolean;
  show_avatars: boolean;
  animations_enabled: boolean;
}

export interface RegionalSettings {
  language: string;
  timezone: string;
  date_format: string;
  time_format: string;
  currency: string;
  number_format: string;
}

export interface ProfileSettings {
  company: string;
  job_title: string;
}

// API methods
export const settingsApi = {
  // Get all settings
  getSettings: async (): Promise<UserSettings> => {
    const response = await authAxios.get('/auth/settings/');
    return response.data;
  },

  // Update all or partial settings
  updateSettings: async (data: Partial<UserSettings>): Promise<{ message: string; settings: UserSettings }> => {
    const response = await authAxios.put('/auth/settings/', data);
    return response.data;
  },

  // Reset settings to defaults
  resetSettings: async (): Promise<{ message: string; settings: UserSettings }> => {
    const response = await authAxios.delete('/auth/settings/');
    return response.data;
  },

  // Notification settings
  getNotificationSettings: async (): Promise<NotificationSettings> => {
    const response = await authAxios.get('/auth/settings/notifications/');
    return response.data;
  },

  updateNotificationSettings: async (data: Partial<NotificationSettings>): Promise<{ message: string; settings: NotificationSettings }> => {
    const response = await authAxios.put('/auth/settings/notifications/', data);
    return response.data;
  },

  // Display settings
  getDisplaySettings: async (): Promise<DisplaySettings> => {
    const response = await authAxios.get('/auth/settings/display/');
    return response.data;
  },

  updateDisplaySettings: async (data: Partial<DisplaySettings>): Promise<{ message: string; settings: DisplaySettings }> => {
    const response = await authAxios.put('/auth/settings/display/', data);
    return response.data;
  },

  // Regional settings
  getRegionalSettings: async (): Promise<RegionalSettings> => {
    const response = await authAxios.get('/auth/settings/regional/');
    return response.data;
  },

  updateRegionalSettings: async (data: Partial<RegionalSettings>): Promise<{ message: string; settings: RegionalSettings }> => {
    const response = await authAxios.put('/auth/settings/regional/', data);
    return response.data;
  },

  // Profile settings
  getProfileSettings: async (): Promise<ProfileSettings> => {
    const response = await authAxios.get('/auth/settings/profile/');
    return response.data;
  },

  updateProfileSettings: async (data: Partial<ProfileSettings>): Promise<{ message: string; settings: ProfileSettings }> => {
    const response = await authAxios.put('/auth/settings/profile/', data);
    return response.data;
  },
};

export default settingsApi;
