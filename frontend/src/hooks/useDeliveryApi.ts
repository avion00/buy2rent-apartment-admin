import { useState, useEffect, useCallback } from 'react';
import { deliveryApi, DeliveryListItem, Delivery, DeliveryFilters } from '@/services/deliveryApi';

export interface UseDeliveriesResult {
  deliveries: DeliveryListItem[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  refetch: () => Promise<void>;
  updateStatus: (id: string, status: string, additionalData?: { received_by?: string; actual_date?: string; status_notes?: string; location?: string; delay_reason?: string }) => Promise<void>;
  deleteDelivery: (id: string) => Promise<void>;
}

export function useDeliveries(filters: DeliveryFilters = {}): UseDeliveriesResult {
  const [deliveries, setDeliveries] = useState<DeliveryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await deliveryApi.getDeliveries(filters);
      setDeliveries(response.results || []);
      setTotalCount(response.count || 0);
    } catch (err: any) {
      console.error('Failed to fetch deliveries:', err);
      setError(err.message || 'Failed to fetch deliveries');
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.status, filters.priority, filters.apartment, filters.vendor, filters.page, filters.page_size]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const updateStatus = async (id: string, status: string, additionalData?: { received_by?: string; actual_date?: string; status_notes?: string; location?: string; delay_reason?: string }) => {
    await deliveryApi.updateStatus(id, status, additionalData);
    await fetchDeliveries();
  };

  const deleteDelivery = async (id: string) => {
    await deliveryApi.deleteDelivery(id);
    await fetchDeliveries();
  };

  return {
    deliveries,
    loading,
    error,
    totalCount,
    refetch: fetchDeliveries,
    updateStatus,
    deleteDelivery,
  };
}

export interface UseDeliveryResult {
  delivery: Delivery | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDelivery(id: string | undefined): UseDeliveryResult {
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDelivery = useCallback(async () => {
    if (!id) {
      setDelivery(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await deliveryApi.getDelivery(id);
      setDelivery(data);
    } catch (err: any) {
      console.error('Failed to fetch delivery:', err);
      setError(err.message || 'Failed to fetch delivery');
      setDelivery(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDelivery();
  }, [fetchDelivery]);

  return {
    delivery,
    loading,
    error,
    refetch: fetchDelivery,
  };
}

export interface DeliveryStatistics {
  scheduled: number;
  in_transit: number;
  delivered: number;
  delayed: number;
  total: number;
}

export function useDeliveryStatistics(): { statistics: DeliveryStatistics; loading: boolean } {
  const [statistics, setStatistics] = useState<DeliveryStatistics>({
    scheduled: 0,
    in_transit: 0,
    delivered: 0,
    delayed: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Fetch all deliveries to calculate stats
        const response = await deliveryApi.getDeliveries({ page_size: 1000 });
        const deliveries = response.results || [];
        
        setStatistics({
          scheduled: deliveries.filter(d => d.status === 'Scheduled').length,
          in_transit: deliveries.filter(d => d.status === 'In Transit').length,
          delivered: deliveries.filter(d => d.status === 'Delivered').length,
          delayed: deliveries.filter(d => d.status === 'Delayed').length,
          total: deliveries.length,
        });
      } catch (err) {
        console.error('Failed to fetch delivery statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { statistics, loading };
}
