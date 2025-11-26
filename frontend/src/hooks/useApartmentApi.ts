import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apartmentApi, type Apartment, type ApartmentFormData } from '@/services/apartmentApi';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

// Query keys factory
const QUERY_KEYS = {
  all: ['apartments'] as const,
  lists: () => [...QUERY_KEYS.all, 'list'] as const,
  list: (params?: any) => [...QUERY_KEYS.lists(), params] as const,
  details: () => [...QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...QUERY_KEYS.details(), id] as const,
};

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook for fetching apartments list
export function useApartments(params?: {
  search?: string;
  type?: string;
  status?: string;
  client?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
}) {
  // Debounce search term
  const debouncedSearch = useDebounce(params?.search, 300);
  
  const queryParams = {
    ...params,
    search: debouncedSearch,
  };

  return useQuery({
    queryKey: QUERY_KEYS.list(queryParams),
    queryFn: () => apartmentApi.getApartments(queryParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    placeholderData: (previousData) => previousData,
  });
}

// Hook for fetching single apartment
export function useApartment(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id!),
    queryFn: () => apartmentApi.getApartment(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for creating apartment
export function useCreateApartment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: ApartmentFormData) => apartmentApi.createApartment(data),
    onSuccess: (newApartment) => {
      // Invalidate and refetch apartments list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      
      toast({
        title: 'Success',
        description: `Apartment "${newApartment.name}" created successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating apartment',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });
}

// Hook for updating apartment
export function useUpdateApartment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ApartmentFormData> }) =>
      apartmentApi.updateApartment(id, data),
    onSuccess: (updatedApartment) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(updatedApartment.id) });
      
      toast({
        title: 'Success',
        description: `Apartment "${updatedApartment.name}" updated successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating apartment',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });
}

// Hook for deleting apartment
export function useDeleteApartment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id }: { id: string; name: string }) => apartmentApi.deleteApartment(id),
    onSuccess: (_, variables) => {
      // Invalidate apartments list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      
      toast({
        title: 'Success',
        description: `Apartment "${variables.name}" deleted successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting apartment',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });
}
