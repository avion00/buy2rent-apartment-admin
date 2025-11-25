import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { clientApi, type Client, type ClientFormData } from '@/services/clientApi';
import { useToast } from '@/hooks/use-toast';
import { useCallback, useEffect, useRef, useState } from 'react';

// Query keys factory for better type safety
const QUERY_KEYS = {
  all: ['clients'] as const,
  lists: () => [...QUERY_KEYS.all, 'list'] as const,
  list: (params?: any) => [...QUERY_KEYS.lists(), params] as const,
  details: () => [...QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...QUERY_KEYS.details(), id] as const,
};

// Debounce hook for search
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

// Enhanced hook for fetching clients list with debounced search
export function useClients(params?: {
  search?: string;
  account_status?: string;
  type?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
}, options?: UseQueryOptions<any>) {
  // Debounce search term for smoother UX
  const debouncedSearch = useDebounce(params?.search, 300);
  
  const queryParams = {
    ...params,
    search: debouncedSearch,
  };

  return useQuery({
    queryKey: QUERY_KEYS.list(queryParams),
    queryFn: () => clientApi.getClients(queryParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false, // Don't refetch on window focus for better UX
    retry: 2, // Retry failed requests twice
    ...options,
  });
}

// Hook for fetching single client
export function useClient(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id!),
    queryFn: () => clientApi.getClient(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for creating client with optimistic update
export function useCreateClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: ClientFormData) => clientApi.createClient(data),
    onMutate: async (newClientData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.all });

      // Snapshot the previous value
      const previousClients = queryClient.getQueryData(QUERY_KEYS.all);

      // Optimistically update to the new value
      const optimisticClient: Client = {
        id: `temp-${Date.now()}`,
        ...newClientData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.lists() },
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            results: [optimisticClient, ...(old.results || [])],
            count: (old.count || 0) + 1,
          };
        }
      );

      // Return a context with the previous and new client
      return { previousClients, optimisticClient };
    },
    onError: (error: Error, newClient, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousClients) {
        queryClient.setQueryData(QUERY_KEYS.all, context.previousClients);
      }
      
      toast({
        title: 'Error creating client',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
    onSuccess: (newClient) => {
      toast({
        title: 'Client created',
        description: `${newClient.name} has been created successfully.`,
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
    },
  });
}

// Hook for updating client
export function useUpdateClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ClientFormData> }) =>
      clientApi.updateClient(id, data),
    onSuccess: (updatedClient) => {
      // Invalidate both the specific client and the list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(updatedClient.id) });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      
      toast({
        title: 'Client updated',
        description: `${updatedClient.name} has been updated successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating client',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });
}

// Hook for deleting client
export function useDeleteClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      clientApi.deleteClient(id).then(() => ({ id, name })),
    onSuccess: (data) => {
      // Invalidate clients list
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      
      toast({
        title: 'Client deleted',
        description: `${data.name} has been deleted successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting client',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });
}

// Hook for replacing client (full update)
export function useReplaceClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ClientFormData }) =>
      clientApi.replaceClient(id, data),
    onSuccess: (updatedClient) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(updatedClient.id) });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      
      toast({
        title: 'Client updated',
        description: `${updatedClient.name} has been updated successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating client',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });
}
