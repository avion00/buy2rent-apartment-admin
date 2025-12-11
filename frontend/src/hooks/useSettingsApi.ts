import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi, UserSettings, NotificationSettings, DisplaySettings, RegionalSettings, ProfileSettings } from '@/services/settingsApi';

// Query keys
export const settingsKeys = {
  all: ['settings'] as const,
  notifications: ['settings', 'notifications'] as const,
  display: ['settings', 'display'] as const,
  regional: ['settings', 'regional'] as const,
  profile: ['settings', 'profile'] as const,
};

// Default settings for when API fails
const defaultSettings: Partial<UserSettings> = {
  company: '',
  job_title: '',
  email_notifications: true,
  push_notifications: true,
  sms_notifications: false,
  order_updates: true,
  payment_alerts: true,
  delivery_notifications: true,
  vendor_messages: true,
  system_alerts: true,
  weekly_reports: false,
  monthly_reports: true,
  sound_enabled: true,
  desktop_notifications: true,
  theme: 'light',
  compact_view: false,
  sidebar_collapsed: false,
  show_avatars: true,
  animations_enabled: true,
  language: 'en',
  timezone: 'UTC+1',
  date_format: 'YYYY-MM-DD',
  time_format: '24h',
  currency: 'HUF',
  number_format: 'hu-HU',
  two_factor_enabled: false,
};

// Get all settings
export const useSettings = () => {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: async () => {
      try {
        return await settingsApi.getSettings();
      } catch (error) {
        console.warn('Failed to fetch settings, using defaults:', error);
        return defaultSettings as UserSettings;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

// Update settings
export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<UserSettings>) => settingsApi.updateSettings(data),
    onSuccess: (response) => {
      queryClient.setQueryData(settingsKeys.all, response.settings);
      // Invalidate sub-queries
      queryClient.invalidateQueries({ queryKey: settingsKeys.notifications });
      queryClient.invalidateQueries({ queryKey: settingsKeys.display });
      queryClient.invalidateQueries({ queryKey: settingsKeys.regional });
      queryClient.invalidateQueries({ queryKey: settingsKeys.profile });
    },
  });
};

// Reset settings to defaults
export const useResetSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: settingsApi.resetSettings,
    onSuccess: (response) => {
      queryClient.setQueryData(settingsKeys.all, response.settings);
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
};

// Notification settings
export const useNotificationSettings = () => {
  return useQuery({
    queryKey: settingsKeys.notifications,
    queryFn: settingsApi.getNotificationSettings,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<NotificationSettings>) => settingsApi.updateNotificationSettings(data),
    onSuccess: (response) => {
      queryClient.setQueryData(settingsKeys.notifications, response.settings);
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
};

// Display settings
export const useDisplaySettings = () => {
  return useQuery({
    queryKey: settingsKeys.display,
    queryFn: settingsApi.getDisplaySettings,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateDisplaySettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<DisplaySettings>) => settingsApi.updateDisplaySettings(data),
    onSuccess: (response) => {
      queryClient.setQueryData(settingsKeys.display, response.settings);
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
};

// Regional settings
export const useRegionalSettings = () => {
  return useQuery({
    queryKey: settingsKeys.regional,
    queryFn: settingsApi.getRegionalSettings,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateRegionalSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<RegionalSettings>) => settingsApi.updateRegionalSettings(data),
    onSuccess: (response) => {
      queryClient.setQueryData(settingsKeys.regional, response.settings);
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
};

// Profile settings
export const useProfileSettings = () => {
  return useQuery({
    queryKey: settingsKeys.profile,
    queryFn: settingsApi.getProfileSettings,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateProfileSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<ProfileSettings>) => settingsApi.updateProfileSettings(data),
    onSuccess: (response) => {
      queryClient.setQueryData(settingsKeys.profile, response.settings);
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
};
