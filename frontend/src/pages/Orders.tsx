import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, FileText, Truck, ArrowUpDown, TrendingUp, Package, DollarSign, Clock, Loader2, Edit, Trash2, MoreHorizontal, Eye, CheckCircle, Copy, XCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { DeliveryTracking } from '@/components/orders/DeliveryTracking';
import { StatusUpdate } from '@/components/orders/StatusUpdate';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useOrders, useOrderStatistics } from '@/hooks/useOrderApi';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const vendorSpending = [
  { vendor: 'IKEA', amount: 28500 },
  { vendor: 'Royalty Line', amount: 15200 },
  { vendor: 'Philips', amount: 12800 },
  { vendor: 'Home Depot', amount: 18900 },
];

const monthlyOrders = [
  { month: 'Jun', orders: 12, spending: 8200 },
  { month: 'Jul', orders: 18, spending: 12400 },
  { month: 'Aug', orders: 15, spending: 9800 },
  { month: 'Sep', orders: 22, spending: 15600 },
  { month: 'Oct', orders: 28, spending: 18900 },
  { month: 'Nov', orders: 25, spending: 21500 },
];

const Orders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  // Use the API hooks
  const { 
    orders, 
    loading, 
    error, 
    totalCount,
    updateStatus,
    markDelivered,
    deleteOrder,
    refetch 
  } = useOrders({
    search: searchTerm,
    status: statusFilter || undefined,
    vendor: vendorFilter || undefined,
  });

  const { statistics, loading: statsLoading } = useOrderStatistics();

  // Get unique vendors from orders
  const uniqueVendors = useMemo(() => {
    const vendors = new Set<string>();
    orders.forEach(order => {
      if (order.vendor_name) {
        vendors.add(order.vendor_name);
      }
    });
    return Array.from(vendors);
  }, [orders]);

  const handleStatusUpdate = async (orderId: string | number, newStatus: string) => {
    try {
      await updateStatus(String(orderId), newStatus);
      setStatusDialogOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;
    try {
      setDeleting(true);
      await deleteOrder(selectedOrder.id);
      setDeleteDialogOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to delete order:', error);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    const colors: Record<string, string> = {
      'draft': 'bg-gray-500/10 text-gray-500',
      'sent': 'bg-blue-500/10 text-blue-500',
    };
    return colors[statusLower] || 'bg-gray-500/10 text-gray-500';
  };

  // Calculate totals from statistics or orders
  const totalSpending = statistics?.total_value || 
    orders.reduce((sum, order) => sum + Number(order.total), 0);
  const avgOrderValue = statistics?.average_order_value || 
    (orders.length > 0 ? totalSpending / orders.length : 0);

  return (
    <PageLayout title="Orders Management">
      <div className="space-y-6">
        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Total Orders
                  </p>
                  <p className="text-3xl font-bold">{loading ? '-' : totalCount || orders.length}</p>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Total Spending
                  </p>
                  <p className="text-3xl font-bold">€{totalSpending.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Avg: €{avgOrderValue.toFixed(0)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Pending
                  </p>
                  <p className="text-3xl font-bold">
                    {loading ? '-' : statistics?.pending_orders || orders.filter(o => o.status.toLowerCase() === 'sent').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Sent to vendor</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Received
                  </p>
                  <p className="text-3xl font-bold">
                    {loading ? '-' : statistics?.delivered_orders || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Check Deliveries page</p>
                </div>
                <Package className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spending by Vendor Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Spending by Vendor</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  amount: { label: "Amount (€)", color: "hsl(var(--primary))" }
                }}
                className="h-[280px]"
              >
                <BarChart data={vendorSpending}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="vendor" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Monthly Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Order Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  orders: { label: "Orders", color: "hsl(var(--primary))" },
                  spending: { label: "Spending (€)", color: "hsl(var(--chart-2))" }
                }}
                className="h-[280px]"
              >
                <LineChart data={monthlyOrders}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="spending" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by PO number, apartment, or vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
            </SelectContent>
          </Select>

          <Select value={vendorFilter} onValueChange={setVendorFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by vendor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vendors</SelectItem>
              {uniqueVendors.map(vendor => (
                <SelectItem key={vendor} value={vendor}>{vendor}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={() => navigate('/orders/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Order
          </Button>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Orders ({loading ? '...' : orders.length})</CardTitle>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sort
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Apartment</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Confirmation</TableHead>
                    <TableHead>Tracking</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Placed On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Loading orders...
                      </TableCell>
                    </TableRow>
                  ) : orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.po_number}</TableCell>
                        <TableCell>{order.apartment_name || 'N/A'}</TableCell>
                        <TableCell>{order.vendor_name || 'N/A'}</TableCell>
                        <TableCell>{order.items_count} items</TableCell>
                        <TableCell>€{Number(order.total).toLocaleString()}</TableCell>
                        <TableCell>
                          {order.confirmation_code ? (
                            <span className="text-xs font-mono">{order.confirmation_code}</span>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {order.tracking_number ? (
                            <span className="text-xs font-mono">{order.tracking_number}</span>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(order.placed_on), 'yyyy-MM-dd')}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-muted"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                              Order Actions
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            {/* View & Edit Section */}
                            <DropdownMenuItem 
                              onClick={() => navigate(`/orders/${order.id}`)}
                              className="cursor-pointer py-2.5"
                            >
                              <Eye className="mr-3 h-4 w-4 text-muted-foreground" />
                              <span>View Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => navigate(`/orders/${order.id}/edit`)}
                              className="cursor-pointer py-2.5"
                            >
                              <Edit className="mr-3 h-4 w-4 text-muted-foreground" />
                              <span>Edit Order</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                navigator.clipboard.writeText(order.po_number);
                                toast({
                                  title: "Copied to clipboard",
                                  description: `PO Number ${order.po_number} has been copied.`,
                                });
                              }}
                              className="cursor-pointer py-2.5"
                            >
                              <Copy className="mr-3 h-4 w-4 text-muted-foreground" />
                              <span>Copy PO Number</span>
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            {/* Status & Tracking Section */}
                            <DropdownMenuLabel className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                              Status & Delivery
                            </DropdownMenuLabel>
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedOrder(order);
                                setStatusDialogOpen(true);
                              }}
                              className="cursor-pointer py-2.5"
                            >
                              <ArrowUpDown className="mr-3 h-4 w-4 text-muted-foreground" />
                              <span>Update Status</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedOrder(order);
                                setTrackingDialogOpen(true);
                              }}
                              className="cursor-pointer py-2.5"
                            >
                              <Truck className="mr-3 h-4 w-4 text-muted-foreground" />
                              <span>Delivery Tracking</span>
                            </DropdownMenuItem>
                            {order.status.toLowerCase() === 'draft' && (
                              <DropdownMenuItem 
                                onClick={() => updateStatus(String(order.id), 'sent')}
                                className="cursor-pointer py-2.5"
                              >
                                <CheckCircle className="mr-3 h-4 w-4 text-blue-500" />
                                <span className="text-blue-600">Mark as Sent</span>
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            
                            {/* Danger Zone */}
                            {(order.status.toLowerCase() === 'draft' || order.status.toLowerCase() === 'sent') && (
                              <DropdownMenuItem 
                                onClick={() => updateStatus(String(order.id), 'cancelled')}
                                className="cursor-pointer py-2.5 text-orange-600 focus:text-orange-600 focus:bg-orange-500/10"
                              >
                                <XCircle className="mr-3 h-4 w-4" />
                                <span>Cancel Order</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedOrder(order);
                                setDeleteDialogOpen(true);
                              }}
                              className="cursor-pointer py-2.5 text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                              <Trash2 className="mr-3 h-4 w-4" />
                              <span>Delete Order</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <DeliveryTracking open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen} order={selectedOrder} />
      <StatusUpdate 
        open={statusDialogOpen} 
        onOpenChange={setStatusDialogOpen} 
        order={selectedOrder}
        onStatusUpdate={handleStatusUpdate}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete order <strong>{selectedOrder?.po_number}</strong>? 
              This action cannot be undone and will permanently remove the order and all its items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrder}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Order'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
};

export default Orders;
