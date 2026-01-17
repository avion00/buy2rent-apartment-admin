import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { clientApi, ClientFormData } from '@/services/clientApi';
import { useUpdateClient } from '@/hooks/useClientApi';
import { useToast } from '@/hooks/use-toast';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Area, AreaChart } from 'recharts';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Building2,
  Package,
  User,
  FileText,
  Calendar,
  ExternalLink,
  MapPin,
  Loader2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Home,
  ShoppingBag,
  Wallet,
  Activity,
  UserCircle,
  Star,
  Award,
  Target,
  Briefcase,
  PieChart as PieChartIcon,
  Zap,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import ClientViewSkeleton from '@/components/skeletons/ClientViewSkeleton';

const ClientView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('portfolio');
  const [analyticsTab, setAnalyticsTab] = useState('overview');
  const [overviewGraphType, setOverviewGraphType] = useState('financial');
  const [apartmentGraphType, setApartmentGraphType] = useState('status');
  const [productGraphType, setProductGraphType] = useState('status');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    email: '',
    phone: '',
    account_status: 'Active',
    type: 'Investor',
    notes: '',
  });

  // Fetch client details from API
  const { data: clientDetails, isLoading, error, refetch } = useQuery({
    queryKey: ['clientDetails', id],
    queryFn: () => clientApi.getClientDetails(id!),
    enabled: !!id,
  });

  const updateClientMutation = useUpdateClient();

  const client = clientDetails;
  
  // Extract data
  const apartmentsResponse = clientDetails?.apartments;
  const clientApartments = apartmentsResponse?.data || [];
  const apartmentsCount = apartmentsResponse?.count || 0;
  
  const productsResponse = clientDetails?.products;
  const clientProducts = productsResponse?.data || [];
  const productsCount = productsResponse?.count || 0;
  
  const statistics = clientDetails?.statistics || {};
  const apartmentStats = statistics?.apartments || {};
  const productStats = statistics?.products || {};
  const financialStats = statistics?.financial || {};

  const getStatusColor = (status: string) => {
    return status === 'Active'
      ? 'bg-success/10 text-success border-success/20'
      : 'bg-muted text-muted-foreground border-border/50';
  };

  const getApartmentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Design Approved': 'bg-primary/10 text-primary border-primary/20',
      'Ordering': 'bg-warning/10 text-warning border-warning/20',
      'Renovating': 'bg-accent/10 text-accent border-accent/20',
      'Completed': 'bg-success/10 text-success border-success/20',
    };
    return colors[status] || 'bg-muted text-muted-foreground border-border/50';
  };

  const handleOpenEditDialog = () => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone || '',
        account_status: client.account_status,
        type: client.type,
        notes: client.notes || '',
      });
      setEditDialogOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name and email are required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateClientMutation.mutateAsync({
        id: id!,
        data: formData,
      });
      toast({
        title: 'Success',
        description: 'Client updated successfully',
      });
      setEditDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  // Prepare chart data
  const apartmentStatusChartData = apartmentStats.by_status
    ? Object.entries(apartmentStats.by_status).map(([status, count]) => ({
        name: status,
        value: count as number,
        fill: status === 'Completed' ? '#10b981' : status === 'Renovating' ? '#8b5cf6' : status === 'Ordering' ? '#f59e0b' : '#3b82f6'
      }))
    : [];

  const productStatusChartData = productStats.by_status
    ? Object.entries(productStats.by_status).map(([status, count]) => ({
        name: status,
        value: count as number,
      }))
    : [];

  const financialChartData = [
    { name: 'Paid', value: financialStats.total_paid || 0, fill: '#10b981' },
    { name: 'Outstanding', value: financialStats.outstanding || 0, fill: '#f59e0b' },
  ];

  const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'];

  // Loading state
  if (isLoading) {
    return <ClientViewSkeleton />;
  }

  // Error or not found state
  if (error || !client) {
    return (
      <PageLayout title="Client Not Found">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Client Not Found</h3>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : "The client you're looking for doesn't exist."}
            </p>
            <Button onClick={() => navigate('/clients')}>
              Back to Clients
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={client.name}>
      {/* Breadcrumbs */}
      <div className="mb-6 flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/clients">Clients</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{client.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleOpenEditDialog}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => {
            if (window.confirm(`Are you sure you want to delete "${client.name}"?`)) {
              navigate('/clients');
            }
          }}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Premium Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/3 to-background border border-border/50">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
          <div className="relative p-8">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/clients")} 
              className="absolute top-4 left-4 flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            {/* Client Profile Header */}
            <div className="flex items-start gap-6 mt-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white shadow-xl">
                  <UserCircle className="h-14 w-14" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-success border-4 border-background flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold text-foreground">{client.name}</h2>
                  <Badge className={getStatusColor(client.account_status)}>{client.account_status}</Badge>
                  <Badge variant="secondary">
                    <Award className="h-3.5 w-3.5 mr-1" />
                    {client.type}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-6 mt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-semibold">{client.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-semibold">{client.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Member Since</p>
                      <p className="text-sm font-semibold">{format(new Date(client.created_at), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                </div>

                {client.notes && (
                  <div className="mt-4 p-3 rounded-lg bg-background/60 border border-border/50">
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <p className="text-sm text-muted-foreground">{client.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Premium Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Apartments Card */}
          <Card className="border-border/50 bg-gradient-to-br from-blue-500/5 to-blue-500/0 hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="h-7 w-7 text-blue-600" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/5 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600/60" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground mb-1">
                  {apartmentStats.total}
                </p>
                <p className="text-sm text-muted-foreground font-medium">Total Apartments</p>
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2 text-xs text-success">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="font-medium">Active Properties</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Card */}
          <Card className="border-border/50 bg-gradient-to-br from-amber-500/5 to-amber-500/0 hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Package className="h-7 w-7 text-amber-600" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/5 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-amber-600/60" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground mb-1">
                  {productStats.total}
                </p>
                <p className="text-sm text-muted-foreground font-medium">Total Products</p>
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2 text-xs text-amber-600">
                    <Target className="w-3 h-3" />
                    <span className="font-medium">Across All Properties</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Value Card */}
          <Card className="border-border/50 bg-gradient-to-br from-green-500/5 to-green-500/0 hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="h-7 w-7 text-green-600" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-green-500/5 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-green-600/60" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground mb-1">
                  {new Intl.NumberFormat('hu-HU').format(productStats.total_value || 0)} Ft
                </p>
                <p className="text-sm text-muted-foreground font-medium">Total Investment</p>
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2 text-xs text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    <span className="font-medium">Portfolio Value</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Outstanding Card */}
          <Card className="border-border/50 bg-gradient-to-br from-orange-500/5 to-orange-500/0 hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertCircle className="h-7 w-7 text-orange-600" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-orange-500/5 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-orange-600/60" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground mb-1">
                  {financialStats.outstanding < 0 ? '-' : ''}{new Intl.NumberFormat('hu-HU').format(Math.abs(financialStats.outstanding || 0))} Ft
                </p>
                <p className="text-sm text-muted-foreground font-medium">Outstanding Amount</p>
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2 text-xs text-orange-600">
                    <Activity className="w-3 h-3" />
                    <span className="font-medium">Pending Payments</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Premium Analytics Dashboard with 3 Tabs */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  Analytics Dashboard
                </CardTitle>
                <CardDescription className="mt-1">Comprehensive insights and analytics</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                <Activity className="h-3 w-3 mr-1" />
                Live Data
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={analyticsTab} onValueChange={setAnalyticsTab} className="w-full">
              <div className="px-6 pt-4">
                <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <PieChartIcon className="h-4 w-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="apartments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Building2 className="h-4 w-4 mr-2" />
                    Apartments
                  </TabsTrigger>
                  <TabsTrigger value="products" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Package className="h-4 w-4 mr-2" />
                    Products
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* OVERVIEW TAB */}
              <TabsContent value="overview" className="p-6 space-y-6 mt-0">
                {/* Key Metrics Cards */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <ShoppingBag className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="text-xs text-muted-foreground font-semibold">Total Orders</p>
                    </div>
                    <p className="text-xl font-bold text-foreground">
                      {clientDetails?.orders?.count || 0}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <Package className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-xs text-muted-foreground font-semibold">Deliveries</p>
                    </div>
                    <p className="text-xl font-bold text-green-600">
                      {clientDetails?.deliveries?.count || 0}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                      </div>
                      <p className="text-xs text-muted-foreground font-semibold">Open Issues</p>
                    </div>
                    <p className="text-xl font-bold text-orange-600">
                      {clientDetails?.issues?.open_count || 0}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <UserCircle className="h-4 w-4 text-purple-600" />
                      </div>
                      <p className="text-xs text-muted-foreground font-semibold">Vendors</p>
                    </div>
                    <p className="text-xl font-bold text-purple-600">
                      {clientDetails?.vendors?.count || new Set(clientProducts.map((p: any) => p.vendor_id).filter(Boolean)).size}
                    </p>
                  </div>
                </div>

                {/* Payment Progress Bar */}
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-foreground">Payment Progress</span>
                    <span className="text-sm font-bold text-primary">
                      {Math.round(((financialStats.total_paid || 0) / (financialStats.total_spent || 1)) * 100)}% Complete
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(((financialStats.total_paid || 0) / (financialStats.total_spent || 1)) * 100, 100)} 
                    className="h-3"
                  />
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span>{new Intl.NumberFormat('hu-HU').format(financialStats.total_paid || 0)} Ft paid</span>
                    <span>{new Intl.NumberFormat('hu-HU').format(financialStats.outstanding || 0)} Ft remaining</span>
                  </div>
                </div>

                {/* Graph Switcher */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Financial Analytics</h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={overviewGraphType === 'financial' ? 'default' : 'outline'}
                      onClick={() => setOverviewGraphType('financial')}
                      className="h-8 text-xs"
                    >
                      <PieChartIcon className="h-3 w-3 mr-1" />
                      Financial
                    </Button>
                    <Button
                      size="sm"
                      variant={overviewGraphType === 'apartments' ? 'default' : 'outline'}
                      onClick={() => setOverviewGraphType('apartments')}
                      className="h-8 text-xs"
                    >
                      <Building2 className="h-3 w-3 mr-1" />
                      Properties
                    </Button>
                    <Button
                      size="sm"
                      variant={overviewGraphType === 'products' ? 'default' : 'outline'}
                      onClick={() => setOverviewGraphType('products')}
                      className="h-8 text-xs"
                    >
                      <Package className="h-3 w-3 mr-1" />
                      Products
                    </Button>
                  </div>
                </div>

                {/* Dynamic Graphs */}
                {overviewGraphType === 'financial' && financialChartData.some(d => d.value > 0) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-card border border-border/50">
                      <p className="text-sm font-semibold text-foreground mb-3">Payment Distribution</p>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={financialChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={70}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {financialChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `${new Intl.NumberFormat('hu-HU').format(value)} Ft`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="p-4 rounded-xl bg-card border border-border/50">
                      <p className="text-sm font-semibold text-foreground mb-3">Payment Breakdown</p>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={financialChartData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                          <XAxis type="number" tick={{ fontSize: 11 }} />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} />
                          <Tooltip formatter={(value: number) => `${new Intl.NumberFormat('hu-HU').format(value)} Ft`} />
                          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                            {financialChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {overviewGraphType === 'apartments' && apartmentStatusChartData.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-card border border-border/50">
                      <p className="text-sm font-semibold text-foreground mb-3">Apartment Status Distribution</p>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={apartmentStatusChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                            outerRadius={70}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {apartmentStatusChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {apartmentStatusChartData.map((item, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                            <span className="text-xs font-medium truncate">{item.name}</span>
                            <span className="text-xs text-muted-foreground ml-auto">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-card border border-border/50">
                      <p className="text-sm font-semibold text-foreground mb-3">Status Breakdown</p>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={apartmentStatusChartData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={70} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                            {apartmentStatusChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {overviewGraphType === 'products' && productStatusChartData.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-card border border-border/50">
                      <p className="text-sm font-semibold text-foreground mb-3">Product Status Distribution</p>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={productStatusChartData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={70} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]}>
                            {productStatusChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="p-4 rounded-xl bg-card border border-border/50">
                      <p className="text-sm font-semibold text-foreground mb-3">Status Breakdown</p>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={productStatusChartData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                          <XAxis type="number" tick={{ fontSize: 11 }} />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={110} />
                          <Tooltip />
                          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                            {productStatusChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {productStatusChartData.slice(0, 6).map((item, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className="text-xs font-medium truncate">{item.name}</span>
                            <span className="text-xs text-muted-foreground ml-auto">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* APARTMENTS TAB */}
              <TabsContent value="apartments" className="p-6 space-y-6 mt-0">
                {/* Apartment-Specific Summary */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      <p className="text-xs text-muted-foreground font-semibold">Completed</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{apartmentStats.by_status?.Completed || 0}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-amber-600" />
                      <p className="text-xs text-muted-foreground font-semibold">In Progress</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{apartmentStats.by_status?.Renovating || 0}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      <p className="text-xs text-muted-foreground font-semibold">Planning</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{apartmentStats.by_status?.Planning || 0}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <p className="text-xs text-muted-foreground font-semibold">Avg Progress</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {Math.round(clientApartments.reduce((sum: number, apt: any) => sum + (apt.progress || 0), 0) / (clientApartments.length || 1))}%
                    </p>
                  </div>
                </div>

                {/* Graph Switcher */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Apartment Analytics</h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={apartmentGraphType === 'status' ? 'default' : 'outline'}
                      onClick={() => setApartmentGraphType('status')}
                      className="h-8 text-xs"
                    >
                      Status
                    </Button>
                    <Button
                      size="sm"
                      variant={apartmentGraphType === 'value' ? 'default' : 'outline'}
                      onClick={() => setApartmentGraphType('value')}
                      className="h-8 text-xs"
                    >
                      Value
                    </Button>
                    <Button
                      size="sm"
                      variant={apartmentGraphType === 'products' ? 'default' : 'outline'}
                      onClick={() => setApartmentGraphType('products')}
                      className="h-8 text-xs"
                    >
                      Products
                    </Button>
                  </div>
                </div>

                {/* Apartment Graphs */}
                {apartmentGraphType === 'status' && apartmentStatusChartData.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-card border border-border/50">
                      <p className="text-sm font-semibold text-foreground mb-3">Status Distribution</p>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={apartmentStatusChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {apartmentStatusChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="p-4 rounded-xl bg-card border border-border/50">
                      <p className="text-sm font-semibold text-foreground mb-3">Status Comparison</p>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={apartmentStatusChartData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                            {apartmentStatusChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {apartmentGraphType === 'value' && (
                  <div className="p-4 rounded-xl bg-card border border-border/50">
                    <p className="text-sm font-semibold text-foreground mb-3">Apartment Value Distribution</p>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={clientApartments.map((apt: any) => {
                        const aptProducts = clientProducts.filter((p: any) => p.apartment_id === apt.id);
                        const totalValue = aptProducts.reduce((sum: number, p: any) => 
                          sum + (parseFloat(p.unit_price || 0) * p.qty), 0
                        );
                        return {
                          name: apt.name,
                          value: totalValue,
                          products: aptProducts.length
                        };
                      })}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(value: number) => `${new Intl.NumberFormat('hu-HU').format(value)} Ft`} />
                        <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {apartmentGraphType === 'products' && (
                  <div className="p-4 rounded-xl bg-card border border-border/50">
                    <p className="text-sm font-semibold text-foreground mb-3">Products per Apartment</p>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={clientApartments.map((apt: any) => ({
                        name: apt.name,
                        products: clientProducts.filter((p: any) => p.apartment_id === apt.id).length
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="products" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Apartment List with Details */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">All Apartments</h3>
                  <div className="space-y-3">
                    {clientApartments.slice(0, 5).map((apartment: any) => {
                      const apartmentProducts = clientProducts.filter((p: any) => p.apartment_id === apartment.id);
                      const totalValue = apartmentProducts.reduce((sum: number, p: any) => 
                        sum + (parseFloat(p.unit_price || 0) * p.qty), 0
                      );
                      
                      return (
                        <div key={apartment.id} className="p-4 rounded-xl bg-gradient-to-br from-card to-muted/20 border border-border/50 hover:border-primary/30 transition-all">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-bold text-foreground">{apartment.name}</h4>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {apartment.address}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className={getApartmentStatusColor(apartment.status)}>
                              {apartment.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            <div className="p-2 rounded-lg bg-muted/40">
                              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Type</p>
                              <p className="text-xs font-bold">{apartment.type || 'N/A'}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-amber-500/10">
                              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Products</p>
                              <p className="text-xs font-bold">{apartmentProducts.length}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-green-500/10">
                              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Value</p>
                              <p className="text-xs font-bold">{new Intl.NumberFormat('hu-HU', { notation: 'compact' }).format(totalValue)} Ft</p>
                            </div>
                            <div className="p-2 rounded-lg bg-primary/10">
                              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Due Date</p>
                              <p className="text-xs font-bold">{apartment.due_date ? format(new Date(apartment.due_date), 'MMM dd') : 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              {/* PRODUCTS TAB */}
              <TabsContent value="products" className="p-6 space-y-6 mt-0">
                {/* Product-Specific Summary */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingBag className="h-5 w-5 text-purple-600" />
                      <p className="text-xs text-muted-foreground font-semibold">Ordered</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{productStats.by_status?.Ordered || 0}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      <p className="text-xs text-muted-foreground font-semibold">Delivered</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{productStats.by_status?.Delivered || 0}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-amber-600" />
                      <p className="text-xs text-muted-foreground font-semibold">Pending</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {productStats.by_status?.Pending || productStats.by_status?.['Not Ordered'] || 0}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <p className="text-xs text-muted-foreground font-semibold">Installed</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {productStats.by_status?.Installed || 0}
                    </p>
                  </div>
                </div>

                {/* Graph Switcher */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Product Analytics</h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={productGraphType === 'status' ? 'default' : 'outline'}
                      onClick={() => setProductGraphType('status')}
                      className="h-8 text-xs"
                    >
                      Status
                    </Button>
                    <Button
                      size="sm"
                      variant={productGraphType === 'category' ? 'default' : 'outline'}
                      onClick={() => setProductGraphType('category')}
                      className="h-8 text-xs"
                    >
                      Category
                    </Button>
                    <Button
                      size="sm"
                      variant={productGraphType === 'vendor' ? 'default' : 'outline'}
                      onClick={() => setProductGraphType('vendor')}
                      className="h-8 text-xs"
                    >
                      Vendors
                    </Button>
                  </div>
                </div>

                {/* Product Graphs */}
                {productGraphType === 'status' && productStatusChartData.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-card border border-border/50">
                      <p className="text-sm font-semibold text-foreground mb-3">Status Distribution</p>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={productStatusChartData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                            {productStatusChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="p-4 rounded-xl bg-card border border-border/50">
                      <p className="text-sm font-semibold text-foreground mb-3">Status Breakdown</p>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={productStatusChartData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                          <XAxis type="number" tick={{ fontSize: 11 }} />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={110} />
                          <Tooltip />
                          <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                            {productStatusChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {productGraphType === 'category' && (
                  <div className="p-4 rounded-xl bg-card border border-border/50">
                    <p className="text-sm font-semibold text-foreground mb-3">Products by Category</p>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={Object.entries(
                        clientProducts.reduce((acc: any, p: any) => {
                          const category = p.category_name || p.category_details?.name || 'Uncategorized';
                          acc[category] = (acc[category] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([name, value]) => ({ name, value })).slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {productGraphType === 'vendor' && (
                  <div className="p-4 rounded-xl bg-card border border-border/50">
                    <p className="text-sm font-semibold text-foreground mb-3">Products by Vendor</p>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={Object.entries(
                        clientProducts.reduce((acc: any, p: any) => {
                          const vendor = p.vendor_name || 'Unknown';
                          acc[vendor] = (acc[vendor] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([name, value]) => ({ name, value })).slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Product Status Legend */}
                {productStatusChartData.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">Status Legend</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {productStatusChartData.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.value} products</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Edit Client Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="pb-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <DialogTitle className="text-xl">Edit Client</DialogTitle>
                  <DialogDescription className="text-sm">
                    Update client information
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/30">
                  <User className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="h-11"
                    required
                  />
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/30">
                  <Mail className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Contact Information</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+36 20 123 4567"
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Account Settings Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/30">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Account Settings</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-medium">
                      Client Type
                    </Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger id="type" className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Investor">Investor</SelectItem>
                        <SelectItem value="Buy2Rent Internal">Buy2Rent Internal</SelectItem>
                        <SelectItem value="Company">Company</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium">
                      Account Status
                    </Label>
                    <Select value={formData.account_status} onValueChange={(value) => setFormData({ ...formData, account_status: value })}>
                      <SelectTrigger id="status" className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/30">
                  <FileText className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Additional Information</h3>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any additional notes or comments about this client..."
                    className="min-h-[100px] resize-none"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="pt-6 border-t border-border/50 gap-3">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} className="flex-1 h-11">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 h-11 bg-primary hover:bg-primary/90" disabled={updateClientMutation.isPending}>
                {updateClientMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default ClientView;
