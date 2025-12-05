import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorApi, CreateVendorData, UpdateVendorData } from '@/services/vendorApi';
import { toast } from 'sonner';

const QUERY_KEYS = {
  vendors: ['vendors'] as const,
  vendor: (id: string) => ['vendors', id] as const,
  vendorProducts: (vendorId: string) => ['vendors', vendorId, 'products'] as const,
};

// Hook for fetching all vendors
export function useVendors(search?: string) {
  return useQuery({
    queryKey: search ? [...QUERY_KEYS.vendors, search] : QUERY_KEYS.vendors,
    queryFn: () => vendorApi.getVendors(search),
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

// Hook for creating a vendor
export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVendorData) => vendorApi.createVendor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vendors });
      toast.success('Vendor created successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to create vendor';
      toast.error(message);
      console.error('Create vendor error:', error);
    },
  });
}

// Hook for updating a vendor
export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVendorData }) =>
      vendorApi.updateVendor(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vendors });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vendor(variables.id) });
      toast.success('Vendor updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to update vendor';
      toast.error(message);
      console.error('Update vendor error:', error);
    },
  });
}

// Hook for deleting a vendor
export function useDeleteVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vendorApi.deleteVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vendors });
      toast.success('Vendor deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to delete vendor';
      toast.error(message);
      console.error('Delete vendor error:', error);
    },
  });
}

// Hook for fetching vendor products
export function useVendorProducts(vendorId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.vendorProducts(vendorId!),
    queryFn: () => vendorApi.getVendorProducts(vendorId!),
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

// Hook for removing a product from vendor
export function useRemoveVendorProduct(vendorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => vendorApi.removeVendorProduct(vendorId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vendorProducts(vendorId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vendor(vendorId) });
      toast.success('Product removed from vendor successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to remove product';
      toast.error(message);
      console.error('Remove product error:', error);
    },
  });
}
