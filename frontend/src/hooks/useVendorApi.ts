import { useQuery } from '@tanstack/react-query';
import { vendorApi } from '@/services/vendorApi';

const QUERY_KEYS = {
  vendors: ['vendors'] as const,
  vendor: (id: string) => ['vendors', id] as const,
};

// Hook for fetching all vendors
export function useVendors() {
  return useQuery({
    queryKey: QUERY_KEYS.vendors,
    queryFn: () => vendorApi.getVendors(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

// Hook for fetching a single vendor
export function useVendor(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.vendor(id!),
    queryFn: () => vendorApi.getVendor(id!),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
