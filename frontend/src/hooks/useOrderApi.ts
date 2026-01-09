import { useState, useEffect, useCallback } from 'react';
import { orderApi, Order, OrderListResponse, CreateOrderData, UpdateOrderData, OrderStatistics, DashboardChartData } from '@/services/orderApi';
import { toast } from 'sonner';

export const useOrders = (params?: {
  search?: string;
  status?: string;
  vendor?: string;
  apartment?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [previousPage, setPreviousPage] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderApi.getOrders(params);
      setOrders(response.results);
      setTotalCount(response.count);
      setNextPage(response.next);
      setPreviousPage(response.previous);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [params?.search, params?.status, params?.vendor, params?.apartment, params?.ordering, params?.page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const createOrder = async (data: CreateOrderData) => {
    try {
      const newOrder = await orderApi.createOrder(data);
      setOrders(prev => [newOrder, ...prev]);
      toast.success('Order created successfully');
      return newOrder;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create order');
      throw err;
    }
  };

  const updateOrder = async (id: string, data: UpdateOrderData) => {
    try {
      const updatedOrder = await orderApi.updateOrder(id, data);
      setOrders(prev => prev.map(order => 
        order.id === id ? updatedOrder : order
      ));
      toast.success('Order updated successfully');
      return updatedOrder;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update order');
      throw err;
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await orderApi.deleteOrder(id);
      setOrders(prev => prev.filter(order => order.id !== id));
      toast.success('Order deleted successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete order');
      throw err;
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const updatedOrder = await orderApi.updateStatus(id, status);
      setOrders(prev => prev.map(order => 
        order.id === id ? updatedOrder : order
      ));
      toast.success(`Order status updated to ${status}`);
      return updatedOrder;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
      throw err;
    }
  };

  const markDelivered = async (id: string, deliveryDate?: string) => {
    try {
      const updatedOrder = await orderApi.markDelivered(id, deliveryDate);
      setOrders(prev => prev.map(order => 
        order.id === id ? updatedOrder : order
      ));
      toast.success('Order marked as delivered');
      return updatedOrder;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to mark order as delivered');
      throw err;
    }
  };

  return {
    orders,
    loading,
    error,
    totalCount,
    nextPage,
    previousPage,
    refetch: fetchOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    updateStatus,
    markDelivered,
  };
};

export const useOrder = (id: string) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await orderApi.getOrder(id);
        setOrder(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch order');
        toast.error('Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  const updateOrder = async (data: UpdateOrderData) => {
    try {
      const updatedOrder = await orderApi.updateOrder(id, data);
      setOrder(updatedOrder);
      toast.success('Order updated successfully');
      return updatedOrder;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update order');
      throw err;
    }
  };

  return {
    order,
    loading,
    error,
    updateOrder,
  };
};

export const useOrderStatistics = () => {
  const [statistics, setStatistics] = useState<OrderStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await orderApi.getStatistics();
        setStatistics(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch statistics');
        console.error('Failed to fetch order statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  return {
    statistics,
    loading,
    error,
  };
};

export const useOrderCharts = () => {
  const [chartData, setChartData] = useState<DashboardChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await orderApi.getDashboardCharts();
        setChartData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch chart data');
        console.error('Failed to fetch order chart data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  return {
    chartData,
    loading,
    error,
  };
};
