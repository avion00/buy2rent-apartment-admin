import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Create axios instance for notification requests
const notificationAxios = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
notificationAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: 'info' | 'success' | 'warning' | 'error' | 'order' | 'delivery' | 'payment' | 'issue' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_read: boolean;
  read_at: string | null;
  action_url?: string;
  action_text?: string;
  related_object_type?: string;
  related_object_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreference {
  id: string;
  email_enabled: boolean;
  email_order_updates: boolean;
  email_delivery_updates: boolean;
  email_payment_updates: boolean;
  email_issue_updates: boolean;
  email_system_messages: boolean;
  app_enabled: boolean;
  app_order_updates: boolean;
  app_delivery_updates: boolean;
  app_payment_updates: boolean;
  app_issue_updates: boolean;
  app_system_messages: boolean;
  daily_digest: boolean;
  weekly_digest: boolean;
}

export interface UnreadCountResponse {
  unread_count: number;
}

export interface MarkAllReadResponse {
  status: string;
  marked_count: number;
}

export interface ClearReadResponse {
  status: string;
  deleted_count: number;
}

// Notification API service
export const notificationApi = {
  // Get all notifications (paginated)
  async getNotifications(params?: {
    notification_type?: string;
    priority?: string;
    is_read?: boolean;
    search?: string;
    ordering?: string;
  }): Promise<Notification[]> {
    const response = await notificationAxios.get<Notification[]>('/notifications/', { params });
    return response.data;
  },

  // Get recent notifications (last 10)
  async getRecentNotifications(): Promise<Notification[]> {
    const response = await notificationAxios.get<Notification[]>('/notifications/recent/');
    return response.data;
  },

  // Get single notification
  async getNotification(id: string): Promise<Notification> {
    const response = await notificationAxios.get<Notification>(`/notifications/${id}/`);
    return response.data;
  },

  // Get unread count
  async getUnreadCount(): Promise<number> {
    const response = await notificationAxios.get<UnreadCountResponse>('/notifications/unread_count/');
    return response.data.unread_count;
  },

  // Mark single notification as read
  async markAsRead(id: string): Promise<Notification> {
    const response = await notificationAxios.post<Notification>(`/notifications/${id}/mark_read/`);
    return response.data;
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<MarkAllReadResponse> {
    const response = await notificationAxios.post<MarkAllReadResponse>('/notifications/mark_all_read/');
    return response.data;
  },

  // Delete notification
  async deleteNotification(id: string): Promise<void> {
    await notificationAxios.delete(`/notifications/${id}/`);
  },

  // Clear all read notifications
  async clearReadNotifications(): Promise<ClearReadResponse> {
    const response = await notificationAxios.delete<ClearReadResponse>('/notifications/clear_read/');
    return response.data;
  },

  // Get notifications by type
  async getByType(type: string): Promise<Notification[]> {
    const response = await notificationAxios.get<Notification[]>('/notifications/by_type/', {
      params: { type }
    });
    return response.data;
  },

  // Create a new notification
  async createNotification(data: {
    title: string;
    message: string;
    notification_type?: Notification['notification_type'];
    priority?: Notification['priority'];
    action_url?: string;
    action_text?: string;
    related_object_type?: string;
    related_object_id?: string;
    metadata?: Record<string, any>;
  }): Promise<Notification> {
    const response = await notificationAxios.post<Notification>('/notifications/', data);
    return response.data;
  },

  // Get notification preferences
  async getPreferences(): Promise<NotificationPreference> {
    const response = await notificationAxios.get<NotificationPreference>('/notification-preferences/');
    return response.data;
  },

  // Update notification preferences
  async updatePreferences(data: Partial<NotificationPreference>): Promise<NotificationPreference> {
    const response = await notificationAxios.post<NotificationPreference>('/notification-preferences/', data);
    return response.data;
  },
};

// Helper to get notification icon based on type
export const getNotificationIcon = (type: Notification['notification_type']) => {
  const icons: Record<string, string> = {
    info: 'Info',
    success: 'CheckCircle',
    warning: 'AlertTriangle',
    error: 'XCircle',
    order: 'ShoppingCart',
    delivery: 'Truck',
    payment: 'CreditCard',
    issue: 'AlertCircle',
    system: 'Bell',
  };
  return icons[type] || 'Bell';
};

// Helper to get notification color based on type
export const getNotificationColor = (type: Notification['notification_type']) => {
  const colors: Record<string, string> = {
    info: 'text-blue-500',
    success: 'text-green-500',
    warning: 'text-amber-500',
    error: 'text-red-500',
    order: 'text-blue-500',
    delivery: 'text-cyan-500',
    payment: 'text-green-500',
    issue: 'text-orange-500',
    system: 'text-purple-500',
  };
  return colors[type] || 'text-muted-foreground';
};

// Helper to format notification time
export const formatNotificationTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
};
