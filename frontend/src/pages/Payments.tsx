import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead, 
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Search, 
  Download,
  Receipt,
  Plus,
  Eye,
  TrendingUp,
  TrendingDown,
  Activity,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
  Edit,
  Trash2,
  MoreHorizontal,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useDataStore } from '@/stores/useDataStore';
import { format, subDays, subMonths, startOfDay, endOfDay } from 'date-fns';
import { RecordPaymentModal } from '@/components/modals/RecordPaymentModal';
import { PaymentHistoryModal } from '@/components/modals/PaymentHistoryModal';
import { PaymentCreateModal } from '@/components/modals/PaymentCreateModal';
import { usePayments, useDeletePayment, useUpdatePayment, useCreatePaymentHistory } from '@/hooks/usePaymentApi';
import { Payment } from '@/services/paymentApi';
import PaymentsPageSkeleton from '@/components/skeletons/PaymentsPageSkeleton';

const Payments = () => {
  const navigate = useNavigate();
  const { apartments, vendors, updatePayment: updateLocalPayment, addPaymentToHistory } = useDataStore();
  
  // Fetch payments from API
  const { data: paymentsData, isLoading, error, refetch } = usePayments({ page_size: 100 });
  const deletePaymentMutation = useDeletePayment();
  const updatePaymentMutation = useUpdatePayment();
  const createPaymentHistoryMutation = useCreatePaymentHistory();
  
  // Get payments from API response
  const apiPayments: Payment[] = paymentsData?.results || [];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [vendorFilter, setVendorFilter] = useState('All');
  const [apartmentFilter, setApartmentFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [timePeriod, setTimePeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [chartType, setChartType] = useState<'trends' | 'status' | 'vendors'>('trends');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  // Get apartment name from payment details
  const getApartmentName = (payment: Payment) => {
    return payment.apartment_details?.name || 'Unknown';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "Paid": "bg-success/10 text-success border-success/20",
      "Partial": "bg-warning/10 text-warning border-warning/20",
      "Unpaid": "bg-muted text-muted-foreground border-border",
      "Overdue": "bg-danger/10 text-danger border-danger/20"
    };
    return colors[status] || "bg-muted";
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "Paid":
        return <CheckCircle className="h-3.5 w-3.5" />;
      case "Partial":
        return <Clock className="h-3.5 w-3.5" />;
      case "Overdue":
        return <AlertCircle className="h-3.5 w-3.5" />;
      default:
        return <DollarSign className="h-3.5 w-3.5" />;
    }
  };

  // Filter payments with all criteria
  const filteredPayments = useMemo(() => {
    return apiPayments.filter(payment => {
      const apartmentName = getApartmentName(payment);
      const vendorName = payment.vendor_name || payment.vendor_details?.name || '';
      
      // Search filter
      const matchesSearch = 
        vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.order_reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apartmentName.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === 'All' || payment.status === statusFilter;
      
      // Vendor filter
      const matchesVendor = vendorFilter === 'All' || vendorName === vendorFilter;
      
      // Apartment filter
      const matchesApartment = apartmentFilter === 'All' || payment.apartment === apartmentFilter;
      
      // Date range filter
      let matchesDateRange = true;
      if (dateFrom || dateTo) {
        const paymentDate = new Date(payment.due_date);
        if (dateFrom) {
          matchesDateRange = matchesDateRange && paymentDate >= new Date(dateFrom);
        }
        if (dateTo) {
          matchesDateRange = matchesDateRange && paymentDate <= new Date(dateTo);
        }
      }
      
      // Amount range filter
      let matchesAmountRange = true;
      if (minAmount || maxAmount) {
        const amount = payment.total_amount || 0;
        if (minAmount) {
          matchesAmountRange = matchesAmountRange && amount >= parseFloat(minAmount);
        }
        if (maxAmount) {
          matchesAmountRange = matchesAmountRange && amount <= parseFloat(maxAmount);
        }
      }
      
      return matchesSearch && matchesStatus && matchesVendor && matchesApartment && 
             matchesDateRange && matchesAmountRange;
    });
  }, [apiPayments, searchQuery, statusFilter, vendorFilter, apartmentFilter, dateFrom, dateTo, minAmount, maxAmount]);

  // Calculate statistics based on filtered payments
  const totalAmount = filteredPayments.reduce((sum, p) => sum + (p.total_amount || 0), 0);
  const totalPaid = filteredPayments.reduce((sum, p) => sum + (p.amount_paid || 0), 0);
  const totalDue = totalAmount - totalPaid;
  const overdueCount = filteredPayments.filter(p => p.status === "Overdue").length;
  const partialCount = filteredPayments.filter(p => p.status === "Partial").length;

  // Get unique vendors from payments
  const uniqueVendors = Array.from(new Set(apiPayments.map(p => p.vendor_name || p.vendor_details?.name || ''))).filter(Boolean).sort();

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setVendorFilter('All');
    setApartmentFilter('All');
    setDateFrom('');
    setDateTo('');
    setMinAmount('');
    setMaxAmount('');
  };

  // Count active filters
  const activeFiltersCount = [
    searchQuery,
    statusFilter !== 'All',
    vendorFilter !== 'All',
    apartmentFilter !== 'All',
    dateFrom,
    dateTo,
    minAmount,
    maxAmount,
  ].filter(Boolean).length;

  const handleRecordPayment = (payment: any) => {
    setSelectedPayment(payment);
    setIsPaymentModalOpen(true);
  };

  const handleViewHistory = (payment: any) => {
    setSelectedPayment(payment);
    setIsHistoryModalOpen(true);
  };

  const handleExport = () => {
    toast.success("Export Started", {
      description: "Your payment report is being generated...",
    });
  };

  // Generate chart data based on time period
  const chartData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let days: number;

    switch (timePeriod) {
      case '7d':
        startDate = subDays(now, 7);
        days = 7;
        break;
      case '30d':
        startDate = subDays(now, 30);
        days = 30;
        break;
      case '90d':
        startDate = subDays(now, 90);
        days = 90;
        break;
      case '1y':
        startDate = subMonths(now, 12);
        days = 365;
        break;
      default:
        startDate = subDays(now, 30);
        days = 30;
    }

    // Generate daily payment data
    const dailyData = [];
    for (let i = days; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const dayPayments = apiPayments.filter(p => {
        if (p.last_payment_date === dateStr) return true;
        return p.payment_history?.some(h => h.date === dateStr);
      });

      const totalPaidForDay = dayPayments.reduce((sum, p) => {
        const dayHistory = p.payment_history?.filter(h => h.date === dateStr) || [];
        return sum + dayHistory.reduce((s, h) => s + (h.amount || 0), 0);
      }, 0);

      dailyData.push({
        date: format(date, 'MMM dd'),
        fullDate: dateStr,
        paid: totalPaidForDay,
        pending: apiPayments
          .filter(p => p.due_date === dateStr && p.status !== 'Paid')
          .reduce((sum, p) => sum + (p.outstanding_amount || 0), 0),
      });
    }

    return dailyData;
  }, [apiPayments, timePeriod]);

  // Status distribution data
  const statusData = useMemo(() => {
    const statusCounts = {
      Paid: apiPayments.filter(p => p.status === 'Paid').length,
      Partial: apiPayments.filter(p => p.status === 'Partial').length,
      Unpaid: apiPayments.filter(p => p.status === 'Unpaid').length,
      Overdue: apiPayments.filter(p => p.status === 'Overdue').length,
    };

    return [
      { name: 'Paid', value: statusCounts.Paid, color: 'hsl(var(--success))' },
      { name: 'Partial', value: statusCounts.Partial, color: 'hsl(var(--warning))' },
      { name: 'Unpaid', value: statusCounts.Unpaid, color: 'hsl(var(--muted-foreground))' },
      { name: 'Overdue', value: statusCounts.Overdue, color: 'hsl(var(--danger))' },
    ].filter(item => item.value > 0);
  }, [apiPayments]);

  // Vendor comparison data
  const vendorData = useMemo(() => {
    const vendorStats: Record<string, { total: number; paid: number; pending: number }> = {};

    apiPayments.forEach(p => {
      const vendorName = p.vendor_name || p.vendor_details?.name || 'Unknown';
      if (!vendorStats[vendorName]) {
        vendorStats[vendorName] = { total: 0, paid: 0, pending: 0 };
      }
      vendorStats[vendorName].total += p.total_amount || 0;
      vendorStats[vendorName].paid += p.amount_paid || 0;
      vendorStats[vendorName].pending += p.outstanding_amount || 0;
    });

    return Object.entries(vendorStats)
      .map(([vendor, stats]) => ({
        vendor,
        ...stats,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [apiPayments]);

  // Show skeleton while loading
  if (isLoading) {
    return (
      <PageLayout title="Payments">
        <PaymentsPageSkeleton />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Payments">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <Button onClick={() => navigate('/payments/new')} size="lg" className="h-11">
            <Plus className="h-5 w-5 mr-2" />
            Create Payment
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Amount</p>
                  <p className="text-2xl font-bold tracking-tight">{totalAmount.toLocaleString()} HUF</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Paid</p>
                  <p className="text-2xl font-bold tracking-tight text-success">{totalPaid.toLocaleString()} HUF</p>
                </div>
                <div className="p-3 bg-success/10 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Outstanding</p>
                  <p className="text-2xl font-bold tracking-tight text-warning">{totalDue.toLocaleString()} HUF</p>
                </div>
                <div className="p-3 bg-warning/10 rounded-lg">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Overdue</p>
                  <p className="text-2xl font-bold tracking-tight text-danger">{overdueCount}</p>
                  <p className="text-xs text-muted-foreground">{partialCount} Partial</p>
                </div>
                <div className="p-3 bg-danger/10 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-danger" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-semibold">Payment Analytics</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Visual insights into payment trends and status</p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={timePeriod} onValueChange={(value: any) => setTimePeriod(value)}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={chartType} onValueChange={(value: any) => setChartType(value)}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="trends" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Payment Trends
                </TabsTrigger>
                <TabsTrigger value="status" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Status Distribution
                </TabsTrigger>
                <TabsTrigger value="vendors" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Vendor Comparison
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trends" className="mt-0">
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: any) => [`${value.toLocaleString()} HUF`, '']}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="paid"
                      stroke="hsl(var(--success))"
                      fillOpacity={1}
                      fill="url(#colorPaid)"
                      name="Paid"
                    />
                    <Area
                      type="monotone"
                      dataKey="pending"
                      stroke="hsl(var(--warning))"
                      fillOpacity={1}
                      fill="url(#colorPending)"
                      name="Pending"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="status" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col justify-center space-y-4">
                    {statusData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <span className="text-2xl font-bold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="vendors" className="mt-0">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={vendorData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="vendor" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: any) => [`${value.toLocaleString()} HUF`, '']}
                    />
                    <Legend />
                    <Bar dataKey="paid" fill="hsl(var(--success))" name="Paid" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pending" fill="hsl(var(--warning))" name="Pending" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            {/* Main Search and Quick Filters */}
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-3">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by vendor, order reference, or apartment..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Quick Filters */}
                <div className="flex gap-2 flex-wrap lg:flex-nowrap">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Status</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Partial">Partial</SelectItem>
                      <SelectItem value="Unpaid">Unpaid</SelectItem>
                      <SelectItem value="Overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={vendorFilter} onValueChange={setVendorFilter}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue placeholder="Vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Vendors</SelectItem>
                      {uniqueVendors.map(vendor => (
                        <SelectItem key={vendor} value={vendor}>{vendor}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant={showAdvancedFilters ? "default" : "outline"}
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="relative"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge 
                        className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground"
                      >
                        {activeFiltersCount}
                      </Badge>
                    )}
                    {showAdvancedFilters ? (
                      <ChevronUp className="h-4 w-4 ml-2" />
                    ) : (
                      <ChevronDown className="h-4 w-4 ml-2" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="pt-4 border-t space-y-4 animate-slide-down">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-foreground">Advanced Filters</h4>
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-8 text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear All
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Apartment Filter */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Apartment</Label>
                      <Select value={apartmentFilter} onValueChange={setApartmentFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Apartments" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Apartments</SelectItem>
                          {apartments.map(apt => (
                            <SelectItem key={apt.id} value={apt.id}>{apt.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date From */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Due Date From</Label>
                      <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                      />
                    </div>

                    {/* Date To */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Due Date To</Label>
                      <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                      />
                    </div>

                    {/* Min Amount */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Min Amount (HUF)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                      />
                    </div>

                    {/* Max Amount */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Max Amount (HUF)</Label>
                      <Input
                        type="number"
                        placeholder="1000000"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Active Filters Summary */}
                  {activeFiltersCount > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {searchQuery && (
                        <Badge variant="secondary" className="gap-1">
                          Search: {searchQuery}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => setSearchQuery('')}
                          />
                        </Badge>
                      )}
                      {statusFilter !== 'All' && (
                        <Badge variant="secondary" className="gap-1">
                          Status: {statusFilter}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => setStatusFilter('All')}
                          />
                        </Badge>
                      )}
                      {vendorFilter !== 'All' && (
                        <Badge variant="secondary" className="gap-1">
                          Vendor: {vendorFilter}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => setVendorFilter('All')}
                          />
                        </Badge>
                      )}
                      {apartmentFilter !== 'All' && (
                        <Badge variant="secondary" className="gap-1">
                          Apartment: {apartments.find(a => a.id === apartmentFilter)?.name || apartmentFilter}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => setApartmentFilter('All')}
                          />
                        </Badge>
                      )}
                      {dateFrom && (
                        <Badge variant="secondary" className="gap-1">
                          From: {format(new Date(dateFrom), 'MMM dd, yyyy')}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => setDateFrom('')}
                          />
                        </Badge>
                      )}
                      {dateTo && (
                        <Badge variant="secondary" className="gap-1">
                          To: {format(new Date(dateTo), 'MMM dd, yyyy')}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => setDateTo('')}
                          />
                        </Badge>
                      )}
                      {minAmount && (
                        <Badge variant="secondary" className="gap-1">
                          Min: {parseFloat(minAmount).toLocaleString()} HUF
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => setMinAmount('')}
                          />
                        </Badge>
                      )}
                      {maxAmount && (
                        <Badge variant="secondary" className="gap-1">
                          Max: {parseFloat(maxAmount).toLocaleString()} HUF
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => setMaxAmount('')}
                          />
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Results Count */}
              <div className="flex items-center justify-between pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{filteredPayments.length}</span> of{' '}
                  <span className="font-semibold text-foreground">{apiPayments.length}</span> payments
                </p>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Payment Records</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto h-[50dvh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Vendor</TableHead>
                    <TableHead className="font-semibold">Order Ref</TableHead>
                    <TableHead className="font-semibold">Apartment</TableHead>
                    <TableHead className="font-semibold text-right">Total Amount</TableHead>
                    <TableHead className="font-semibold text-right">Paid</TableHead>
                    <TableHead className="font-semibold text-right">Balance</TableHead>
                    <TableHead className="font-semibold">Due Date</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Receipt className="h-12 w-12 text-muted-foreground/50" />
                          <p>No payments found matching your filters</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((payment) => {
                      const totalAmount = payment.total_amount || 0;
                      const amountPaid = payment.amount_paid || 0;
                      const balance = payment.outstanding_amount || 0;
                      const isOverdue = payment.status === "Overdue";
                      const dueDate = new Date(payment.due_date);
                      const today = new Date();
                      const isPastDue = dueDate < today && payment.status !== "Paid";
                      const vendorName = payment.vendor_name || payment.vendor_details?.name || 'Unknown';
                      
                      return (
                        <TableRow 
                          key={payment.id} 
                          className={cn(
                            "transition-colors cursor-pointer hover:bg-muted/50",
                            isOverdue && "bg-danger/5 hover:bg-danger/10"
                          )}
                          onClick={() => navigate(`/payments/${payment.id}`)}
                        >
                          <TableCell>
                            <div className="font-medium text-foreground">{vendorName}</div>
                            {payment.notes && (
                              <div className="text-xs text-muted-foreground mt-0.5 max-w-[200px] truncate">
                                {payment.notes}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="font-mono text-sm">{payment.order_reference}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal">
                              {getApartmentName(payment)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-semibold">{totalAmount.toLocaleString()} HUF</span>
                          </TableCell>
                          <TableCell className="text-right">
                            {amountPaid > 0 ? (
                              <div className="space-y-0.5">
                                <div className="font-semibold text-success">
                                  {amountPaid.toLocaleString()} HUF
                                </div>
                                {payment.last_payment_date && (
                                  <div className="text-xs text-muted-foreground">
                                    {format(new Date(payment.last_payment_date), 'MMM dd')}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {balance > 0 ? (
                              <span className={cn(
                                "font-semibold",
                                isOverdue ? "text-danger" : "text-warning"
                              )}>
                                {balance.toLocaleString()} HUF
                              </span>
                            ) : (
                              <span className="text-success">✓ Paid</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className={cn(
                              "text-sm",
                              isPastDue && "text-danger font-semibold"
                            )}>
                              {format(new Date(payment.due_date), 'MMM dd, yyyy')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(payment.status)}>
                              {getStatusIcon(payment.status)}
                              <span className="ml-1">{payment.status}</span>
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1">
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => navigate(`/payments/${payment.id}`)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  
                                  {/* Record Payment - only show for Unpaid or Partial */}
                                  {payment.status !== 'Paid' && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem 
                                        onClick={() => handleRecordPayment(payment)}
                                        className="text-success focus:text-success"
                                      >
                                        <DollarSign className="h-4 w-4 mr-2" />
                                        Record Payment
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => navigate(`/payments/${payment.id}/edit`)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Payment
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-danger focus:text-danger"
                                    onClick={() => {
                                      setPaymentToDelete(payment);
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Payment
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Recording Modal */}
      <RecordPaymentModal 
        payment={selectedPayment}
        open={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        onSave={async (amount, method, reference, note) => {
          if (selectedPayment) {
            try {
              // Create a payment history record - this will auto-update the payment's amount_paid
              await createPaymentHistoryMutation.mutateAsync({
                payment: selectedPayment.id,
                date: new Date().toISOString().split('T')[0],
                amount: amount,
                method: method,
                reference_no: reference,
                note: note,
              });
              
              toast.success("Payment Recorded", {
                description: `${amount.toLocaleString()} HUF recorded successfully`,
              });
              setIsPaymentModalOpen(false);
              refetch();
            } catch (error) {
              toast.error("Failed to record payment");
            }
          }
        }}
      />

      {/* Payment History Modal */}
      <PaymentHistoryModal 
        payment={selectedPayment}
        open={isHistoryModalOpen}
        onOpenChange={setIsHistoryModalOpen}
      />

      {/* Create Payment Modal */}
      <PaymentCreateModal 
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent 
          className="max-w-md"
          onKeyDown={async (e) => {
            if (e.key === 'Enter' && paymentToDelete && !deletePaymentMutation.isPending) {
              e.preventDefault();
              try {
                await deletePaymentMutation.mutateAsync(paymentToDelete.id);
                toast.success("Payment Deleted", {
                  description: `Payment ${paymentToDelete.order_reference} has been deleted.`,
                });
                setDeleteDialogOpen(false);
                setPaymentToDelete(null);
                refetch();
              } catch (error) {
                toast.error("Failed to delete payment");
              }
            }
          }}
        >
          <AlertDialogHeader className="space-y-4">
            {/* Warning Icon */}
            <div className="mx-auto w-14 h-14 rounded-full bg-danger/10 flex items-center justify-center">
              <AlertTriangle className="h-7 w-7 text-danger" />
            </div>
            
            <div className="text-center space-y-2">
              <AlertDialogTitle className="text-xl">Delete Payment</AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                Are you sure you want to delete this payment record?
              </AlertDialogDescription>
            </div>
            
            {/* Payment Info Card */}
            {paymentToDelete && (
              <div className="bg-muted/50 rounded-lg p-4 border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order Reference</span>
                  <span className="font-semibold">{paymentToDelete.order_reference}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Vendor</span>
                  <span className="font-medium">{paymentToDelete.vendor_name || paymentToDelete.vendor_details?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold text-primary">
                    {(paymentToDelete.total_amount || 0).toLocaleString()} HUF
                  </span>
                </div>
              </div>
            )}
            
            <p className="text-sm text-center text-muted-foreground">
              <AlertTriangle className="h-3.5 w-3.5 inline mr-1 text-warning" />
              This action cannot be undone. All payment history will be lost.
            </p>
          </AlertDialogHeader>
          
          <AlertDialogFooter className="sm:space-x-3 mt-2">
            <AlertDialogCancel className="flex-1 sm:flex-none">
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="flex-1 sm:flex-none bg-danger text-danger-foreground hover:bg-danger/90"
              disabled={deletePaymentMutation.isPending}
              onClick={async () => {
                if (paymentToDelete) {
                  try {
                    await deletePaymentMutation.mutateAsync(paymentToDelete.id);
                    toast.success("Payment Deleted", {
                      description: `Payment ${paymentToDelete.order_reference} has been deleted.`,
                    });
                    setDeleteDialogOpen(false);
                    setPaymentToDelete(null);
                    refetch();
                  } catch (error) {
                    toast.error("Failed to delete payment");
                  }
                }
              }}
            >
              {deletePaymentMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Payment
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
};

export default Payments;
