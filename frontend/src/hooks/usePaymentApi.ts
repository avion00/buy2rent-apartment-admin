import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentApi, Payment, PaymentFormData, PaymentHistory, CreatePaymentFromOrderData } from '@/services/paymentApi';

// Query keys
export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...paymentKeys.lists(), filters] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
  history: (paymentId?: string) => [...paymentKeys.all, 'history', paymentId] as const,
};

// Get all payments
export const usePayments = (params?: {
  page?: number;
  page_size?: number;
  apartment?: string;
  vendor?: string;
  status?: string;
  search?: string;
  ordering?: string;
}) => {
  return useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: () => paymentApi.getPayments(params),
  });
};

// Get single payment
export const usePayment = (id: string) => {
  return useQuery({
    queryKey: paymentKeys.detail(id),
    queryFn: () => paymentApi.getPayment(id),
    enabled: !!id,
  });
};

// Create payment
export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PaymentFormData) => paymentApi.createPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
    },
  });
};

// Create payment from order (new)
export const useCreatePaymentFromOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentFromOrderData) => paymentApi.createPaymentFromOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
    },
  });
};

// Update payment
export const useUpdatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PaymentFormData> }) =>
      paymentApi.updatePayment(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.detail(data.id) });
    },
  });
};

// Partial update payment
export const usePatchPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PaymentFormData> }) =>
      paymentApi.patchPayment(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.detail(data.id) });
    },
  });
};

// Delete payment
export const useDeletePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => paymentApi.deletePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
    },
  });
};

// Get payment history
export const usePaymentHistory = (paymentId?: string) => {
  return useQuery({
    queryKey: paymentKeys.history(paymentId),
    queryFn: () => paymentApi.getPaymentHistory(paymentId),
  });
};

// Create payment history entry
export const useCreatePaymentHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      payment: string;
      date: string;
      amount: number;
      method: string;
      reference_no?: string;
      note?: string;
    }) => paymentApi.createPaymentHistory(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.history(data.payment) });
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.details() });
    },
  });
};

// Delete payment history entry
export const useDeletePaymentHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => paymentApi.deletePaymentHistory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.history() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.details() });
    },
  });
};
