import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface KPIStat {
  value: number;
  trend: number;
  trend_label: string;
}

export interface DashboardKPI {
  active_apartments: KPIStat;
  pending_orders: KPIStat;
  open_issues: KPIStat;
  deliveries_this_week: KPIStat;
  overdue_payments: KPIStat;
}

export interface OrdersChartData {
  month: string;
  ordered: number;
  delivered: number;
}

export interface SpendingChartData {
  month: string;
  amount: number;
}

export interface DashboardOverview {
  kpi: DashboardKPI;
  orders_chart: OrdersChartData[];
  spending_chart: SpendingChartData[];
}

export interface RecentOrder {
  id: string;
  po_number: string;
  apartment: string;
  vendor: string;
  total: number;
  status: string;
  placed_on: string;
}

export interface RecentIssue {
  id: string;
  title: string;
  apartment: string | null;
  priority: string;
  status: string;
  created_at: string;
}

export interface RecentPayment {
  id: string;
  vendor: string | null;
  apartment: string | null;
  order_reference: string;
  total_amount: number;
  amount_paid: number;
  outstanding: number;
  status: string;
  due_date: string | null;
}

export interface RecentActivities {
  activities: any[];
  recent_orders: RecentOrder[];
  recent_issues: RecentIssue[];
  recent_payments: RecentPayment[];
}

// API methods
export const dashboardApi = {
  // Get complete dashboard overview
  getOverview: async (): Promise<DashboardOverview> => {
    const response = await axiosInstance.get('/dashboard/overview/');
    return response.data;
  },

  // Get detailed stats
  getStats: async () => {
    const response = await axiosInstance.get('/dashboard/stats/');
    return response.data;
  },

  // Get chart data
  getCharts: async () => {
    const response = await axiosInstance.get('/dashboard/charts/');
    return response.data;
  },

  // Get recent activities
  getRecentActivities: async (): Promise<RecentActivities> => {
    const response = await axiosInstance.get('/dashboard/recent-activities/');
    return response.data;
  },

  // Get quick stats
  getQuickStats: async () => {
    const response = await axiosInstance.get('/dashboard/quick-stats/');
    return response.data;
  },
};

export default dashboardApi;
