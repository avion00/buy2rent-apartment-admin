import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productApi, type Product, type ProductFormData } from '@/services/productApi';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

// Query keys factory
const QUERY_KEYS = {
  all: ['products'] as const,
  lists: () => [...QUERY_KEYS.all, 'list'] as const,
  list: (params?: any) => [...QUERY_KEYS.lists(), params] as const,
  details: () => [...QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...QUERY_KEYS.details(), id] as const,
  byApartment: (apartmentId: string) => [...QUERY_KEYS.all, 'apartment', apartmentId] as const,
  byCategory: () => [...QUERY_KEYS.all, 'category'] as const,
  categories: (apartmentId: string) => [...QUERY_KEYS.all, 'categories', apartmentId] as const,
  statistics: (apartmentId?: string) => [...QUERY_KEYS.all, 'statistics', apartmentId] as const,
  importSessions: (apartmentId: string) => [...QUERY_KEYS.all, 'importSessions', apartmentId] as const,
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

// Hook for fetching products list
export function useProducts(params?: {
  search?: string;
  apartment?: string;
  category?: string;
  status?: string;
  vendor?: string;
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
    queryFn: () => productApi.getProducts(queryParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    placeholderData: (previousData) => previousData,
  });
}

// Hook for fetching products by apartment
export function useProductsByApartment(apartmentId: string | null, params?: {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  page_size?: number;
}) {
  const debouncedSearch = useDebounce(params?.search, 300);
  
  const queryParams = {
    ...params,
    search: debouncedSearch,
  };

  return useQuery({
    queryKey: [...QUERY_KEYS.byApartment(apartmentId!), queryParams],
    queryFn: async () => {
      const data = await productApi.getProductsByApartment(apartmentId!, queryParams);
      // API returns array directly, wrap it in expected format
      return Array.isArray(data) ? data : [];
    },
    enabled: !!apartmentId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
    placeholderData: (previousData) => previousData,
  });
}

// Hook for fetching products by category
export function useProductsByCategory(params?: {
  apartment?: string;
  category?: string;
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: QUERY_KEYS.byCategory(),
    queryFn: () => productApi.getProductsByCategory(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// Hook for fetching single product
export function useProduct(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id!),
    queryFn: () => productApi.getProduct(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for creating product
export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: ProductFormData) => productApi.createProduct(data),
    onSuccess: (newProduct) => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.byApartment(newProduct.apartment) });
      
      toast({
        title: 'Success',
        description: `Product "${newProduct.product}" created successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating product',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });
}

// Hook for updating product
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductFormData> }) =>
      productApi.updateProduct(id, data),
    onSuccess: (updatedProduct) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(updatedProduct.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.byApartment(updatedProduct.apartment) });
      
      toast({
        title: 'Success',
        description: `Product "${updatedProduct.product}" updated successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating product',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });
}

// Hook for deleting product
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id }: { id: string; name: string; apartmentId: string }) => 
      productApi.deleteProduct(id),
    onSuccess: (_, variables) => {
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.byApartment(variables.apartmentId) });
      
      toast({
        title: 'Success',
        description: `Product "${variables.name}" deleted successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting product',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });
}

// Hook for fetching product categories
export function useProductCategories(apartmentId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.categories(apartmentId!),
    queryFn: () => productApi.getProductCategories(apartmentId!),
    enabled: !!apartmentId,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache
    retry: 1, // Only retry once on failure
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });
}

// Hook for creating a new category
export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: { name: string; apartment: string; sheet_name?: string; description?: string }) =>
      productApi.createCategory(data),
    onSuccess: (data, variables) => {
      // Invalidate categories list for this apartment
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories(variables.apartment) });
      
      toast({
        title: 'Success',
        description: `Category "${data.name}" created successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating category',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });
}

// Hook for importing products
export function useImportProducts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ file, apartmentId }: { file: File; apartmentId: string }) =>
      productApi.importProducts(file, apartmentId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.byApartment(variables.apartmentId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.importSessions(variables.apartmentId) });
      
      toast({
        title: 'Success',
        description: `Products imported successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error importing products',
        description: error.message || 'Failed to import products',
        variant: 'destructive',
      });
    },
  });
}

// Hook for fetching import sessions
export function useImportSessions(apartmentId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.importSessions(apartmentId!),
    queryFn: () => productApi.getImportSessions(apartmentId!),
    enabled: !!apartmentId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for deleting import session
export function useDeleteImportSession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ sessionId, apartmentId }: { sessionId: string; apartmentId: string }) =>
      productApi.deleteImportSession(sessionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.importSessions(variables.apartmentId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.byApartment(variables.apartmentId) });
      
      toast({
        title: 'Success',
        description: 'Import session deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting import session',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });
}

// Hook for downloading import template
export function useDownloadImportTemplate() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => productApi.downloadImportTemplate(),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'product_import_template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Success',
        description: 'Template downloaded successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error downloading template',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });
}

// Hook for fetching product statistics
export function useProductStatistics(apartmentId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.statistics(apartmentId),
    queryFn: () => productApi.getProductStatistics(apartmentId),
    staleTime: 5 * 60 * 1000,
  });
}
