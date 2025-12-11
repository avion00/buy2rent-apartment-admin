import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboardApi';

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  overview: ['dashboard', 'overview'] as const,
  stats: ['dashboard', 'stats'] as const,
  charts: ['dashboard', 'charts'] as const,
  recentActivities: ['dashboard', 'recent-activities'] as const,
  quickStats: ['dashboard', 'quick-stats'] as const,
};

// Get complete dashboard overview
export const useDashboardOverview = () => {
  return useQuery({
    queryKey: dashboardKeys.overview,
    queryFn: dashboardApi.getOverview,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// Get detailed stats
export const useDashboardStats = () => {
  return useQuery({
    queryKey: dashboardKeys.stats,
    queryFn: dashboardApi.getStats,
    staleTime: 60 * 1000,
  });
};

// Get chart data
export const useDashboardCharts = () => {
  return useQuery({
    queryKey: dashboardKeys.charts,
    queryFn: dashboardApi.getCharts,
    staleTime: 60 * 1000,
  });
};

// Get recent activities
export const useDashboardRecentActivities = () => {
  return useQuery({
    queryKey: dashboardKeys.recentActivities,
    queryFn: dashboardApi.getRecentActivities,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Get quick stats
export const useDashboardQuickStats = () => {
  return useQuery({
    queryKey: dashboardKeys.quickStats,
    queryFn: dashboardApi.getQuickStats,
    staleTime: 60 * 1000,
  });
};
