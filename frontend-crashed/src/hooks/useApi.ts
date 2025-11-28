import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientApi, apartmentApi, vendorApi, productApi, Client, Apartment, Vendor, Product, ProductCategory } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

// Query Keys
export const queryKeys = {
  clients: {
    all: ['clients'] as const,
    lists: () => [...queryKeys.clients.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.clients.lists(), { filters }] as const,
    details: () => [...queryKeys.clients.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.clients.details(), id] as const,
  },
  apartments: {
    all: ['apartments'] as const,
    lists: () => [...queryKeys.apartments.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.apartments.lists(), { filters }] as const,
    details: () => [...queryKeys.apartments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.apartments.details(), id] as const,
  },
  vendors: {
    all: ['vendors'] as const,
    lists: () => [...queryKeys.vendors.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.vendors.lists(), { filters }] as const,
    details: () => [...queryKeys.vendors.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.vendors.details(), id] as const,
  },
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.products.lists(), { filters }] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
  },
  productCategories: {
    all: ['productCategories'] as const,
    lists: () => [...queryKeys.productCategories.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.productCategories.lists(), { filters }] as const,
  },
};

// Client Hooks
export function useClients(params?: { search?: string; type?: string; account_status?: string }) {
  return useQuery({
    queryKey: queryKeys.clients.list(params || {}),
    queryFn: () => clientApi.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Product Category Hooks
export function useProductCategories(apartmentId?: string) {
  return useQuery<ProductCategory[]>({
    queryKey: queryKeys.productCategories.list({ apartment_id: apartmentId }),
    queryFn: () => productApi.getCategories({ apartment_id: apartmentId! }),
    enabled: !!apartmentId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: queryKeys.clients.detail(id),
    queryFn: () => clientApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => clientApi.create(client),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.lists() });
      toast({
        title: 'Client created',
        description: `${data.name} has been created successfully.`,
      });
    },
    onError: (error: Error) => {
      console.error('Create client error:', error);
      toast({
        title: 'Failed to create client',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, client }: { id: string; client: Partial<Client> }) =>
      clientApi.update(id, client),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.lists() });
      queryClient.setQueryData(queryKeys.clients.detail(variables.id), data);
      toast({
        title: 'Client updated',
        description: `${data.name} has been updated successfully.`,
      });
    },
    onError: (error: Error) => {
      console.error('Update client error:', error);
      toast({
        title: 'Failed to update client',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => clientApi.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: queryKeys.clients.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.lists() });
      toast({
        title: 'Client deleted',
        description: 'The client has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      console.error('Delete client error:', error);
      toast({
        title: 'Failed to delete client',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

// Apartment Hooks
export function useApartments(params?: { 
  type?: string; 
  status?: string; 
  client?: string; 
  search?: string; 
  ordering?: string;
}) {
  return useQuery({
    queryKey: queryKeys.apartments.list(params || {}),
    queryFn: async () => {
      console.log('🔍 Fetching apartments with params:', params);
      const result = await apartmentApi.getAll(params);
      console.log('📦 Apartments API response:', result);
      console.log('📊 Number of apartments:', Array.isArray(result) ? result.length : 'NOT AN ARRAY');
      return result;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useApartment(id: string) {
  return useQuery({
    queryKey: queryKeys.apartments.detail(id),
    queryFn: () => apartmentApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateApartment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (apartment: Omit<Apartment, 'id' | 'created_at' | 'updated_at' | 'client_details'>) => 
      apartmentApi.create(apartment),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.apartments.lists() });
      toast({
        title: 'Apartment created',
        description: `${data.name} has been created successfully.`,
      });
    },
    onError: (error: Error) => {
      console.error('Create apartment error:', error);
      toast({
        title: 'Failed to create apartment',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateApartment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, apartment }: { id: string; apartment: Partial<Apartment> }) =>
      apartmentApi.update(id, apartment),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.apartments.lists() });
      queryClient.setQueryData(queryKeys.apartments.detail(variables.id), data);
      toast({
        title: 'Apartment updated',
        description: `${data.name} has been updated successfully.`,
      });
    },
    onError: (error: Error) => {
      console.error('Update apartment error:', error);
      toast({
        title: 'Failed to update apartment',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteApartment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => apartmentApi.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: queryKeys.apartments.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.apartments.lists() });
      toast({
        title: 'Apartment deleted',
        description: 'The apartment has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      console.error('Delete apartment error:', error);
      toast({
        title: 'Failed to delete apartment',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

// Vendor Hooks
export function useVendors() {
  return useQuery({
    queryKey: queryKeys.vendors.lists(),
    queryFn: () => vendorApi.getAll(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useVendor(id: string) {
  return useQuery({
    queryKey: ['vendor', id],
    queryFn: () => vendorApi.getById(id),
    enabled: !!id && id.length > 0,
    staleTime: Infinity, // Never consider stale
    gcTime: Infinity, // Never garbage collect
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    retry: false, // Don't retry failed requests
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (vendor: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>) => vendorApi.create(vendor),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors.lists() });
      toast({
        title: 'Vendor created',
        description: `${data.name} has been created successfully.`,
      });
    },
    onError: (error: Error) => {
      console.error('Create vendor error:', error);
      toast({
        title: 'Failed to create vendor',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, vendor }: { id: string; vendor: Partial<Vendor> }) =>
      vendorApi.update(id, vendor),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors.lists() });
      queryClient.setQueryData(queryKeys.vendors.detail(variables.id), data);
      toast({
        title: 'Vendor updated',
        description: `${data.name} has been updated successfully.`,
      });
    },
    onError: (error: Error) => {
      console.error('Update vendor error:', error);
      toast({
        title: 'Failed to update vendor',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => vendorApi.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: queryKeys.vendors.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors.lists() });
      toast({
        title: 'Vendor deleted',
        description: 'The vendor has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      console.error('Delete vendor error:', error);
      toast({
        title: 'Failed to delete vendor',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

// Product Hooks
export function useProducts(params?: { 
  apartment?: string; 
  vendor?: string; 
  status?: string; 
  search?: string; 
}) {
  return useQuery({
    queryKey: queryKeys.products.list(params || {}),
    queryFn: () => productApi.getAll(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'apartment_details' | 'vendor_details' | 'vendor_name' | 'total_amount' | 'outstanding_balance' | 'status_tags' | 'delivery_status_tags'>) => 
      productApi.create(product),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      toast({
        title: 'Product created',
        description: `${data.product} has been created successfully.`,
      });
    },
    onError: (error: Error) => {
      console.error('Create product error:', error);
      toast({
        title: 'Failed to create product',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

export function useCreateProductWithImage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ product, imageFile }: { 
      product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'apartment_details' | 'vendor_details' | 'vendor_name' | 'total_amount' | 'outstanding_balance' | 'status_tags' | 'delivery_status_tags'>,
      imageFile?: File 
    }) => productApi.createWithImage(product, imageFile),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      toast({
        title: 'Product created',
        description: `${data.product} has been created successfully.`,
      });
    },
    onError: (error: Error) => {
      console.error('Create product error:', error);
      toast({
        title: 'Failed to create product',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, product }: { id: string; product: Partial<Product> }) =>
      productApi.update(id, product),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      queryClient.setQueryData(queryKeys.products.detail(variables.id), data);
      toast({
        title: 'Product updated',
        description: `${data.product} has been updated successfully.`,
      });
    },
    onError: (error: Error) => {
      console.error('Update product error:', error);
      toast({
        title: 'Failed to update product',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => productApi.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: queryKeys.products.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      toast({
        title: 'Product deleted',
        description: 'The product has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      console.error('Delete product error:', error);
      toast({
        title: 'Failed to delete product',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });
}
