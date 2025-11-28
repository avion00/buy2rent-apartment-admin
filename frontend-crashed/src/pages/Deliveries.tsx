import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Calendar, Search, Clock, Truck, Eye, MapPinned, CheckCircle2, 
  Package, TrendingUp, AlertTriangle, Filter 
} from 'lucide-react';
import { deliveries } from '@/data/mockData';
import { DeliveryDetails } from '@/components/deliveries/DeliveryDetails';
import { DeliveryStatusUpdate } from '@/components/deliveries/DeliveryStatusUpdate';
import { DeliveryTracking } from '@/components/deliveries/DeliveryTracking';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const Deliveries = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [deliveriesData, setDeliveriesData] = useState(deliveries);
  const [selectedDelivery, setSelectedDelivery] = useState<typeof deliveries[0] | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);

  const filteredDeliveries = deliveriesData.filter(delivery => {
    const matchesSearch = 
      delivery.apartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.order_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.tracking_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || delivery.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleStatusUpdate = (deliveryId: number, newStatus: string, receivedBy?: string, actualDelivery?: string) => {
    setDeliveriesData(prev => prev.map(d => 
      d.id === deliveryId 
        ? { ...d, status: newStatus, received_by: receivedBy || d.received_by, actual_delivery: actualDelivery || d.actual_delivery }
        : d
    ));
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Scheduled': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      'In Transit': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
      'Delivered': 'bg-green-500/10 text-green-600 dark:text-green-400',
      'Delayed': 'bg-red-500/10 text-red-600 dark:text-red-400',
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'High': 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      'Medium': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
      'Low': 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    };
    return colors[priority] || 'bg-muted text-muted-foreground';
  };

  // Chart data for vendor deliveries
  const vendorDeliveryData = Object.entries(
    deliveriesData.reduce((acc, delivery) => {
      acc[delivery.vendor] = (acc[delivery.vendor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([vendor, count]) => ({
    vendor: vendor.split(' ')[0],
    deliveries: count,
  }));

  // Weekly delivery trend data
  const weeklyTrendData = [
    { day: 'Mon', deliveries: 8 },
    { day: 'Tue', deliveries: 12 },
    { day: 'Wed', deliveries: 10 },
    { day: 'Thu', deliveries: 15 },
    { day: 'Fri', deliveries: 11 },
    { day: 'Sat', deliveries: 5 },
    { day: 'Sun', deliveries: 3 },
  ];

  return (
    <PageLayout title="Deliveries">
      <div className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-hover-effect">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm text-muted-foreground">Scheduled</p>
                  <p className="text-2xl font-bold">
                    {deliveriesData.filter(d => d.status === 'Scheduled').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-500/10">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover-effect">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm text-muted-foreground">In Transit</p>
                  <p className="text-2xl font-bold">
                    {deliveriesData.filter(d => d.status === 'In Transit').length}
                  </p>
                  <p className="text-sm text-success flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    Active
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-yellow-500/10">
                  <Truck className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover-effect">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm text-muted-foreground">Delivered</p>
                  <p className="text-2xl font-bold">
                    {deliveriesData.filter(d => d.status === 'Delivered').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
                <div className="p-2.5 rounded-xl bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover-effect">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm text-muted-foreground">Delayed</p>
                  <p className="text-2xl font-bold">
                    {deliveriesData.filter(d => d.status === 'Delayed').length}
                  </p>
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    Attention
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-red-500/10">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Deliveries by Vendor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={vendorDeliveryData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="vendor" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }} 
                  />
                  <Bar dataKey="deliveries" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Weekly Delivery Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weeklyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="deliveries" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Calendar/List View */}
        <Tabs defaultValue="list" className="w-full">
          <div className="flex flex-col gap-3 mb-3">
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <TabsList>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              </TabsList>

              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                <Input
                  placeholder="Search by apartment, vendor, order..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 bg-muted/30 border-border/50 focus:bg-background transition-colors"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Filters:</span>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] h-11 bg-muted/30 border-border/50">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="In Transit">In Transit</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Delayed">Delayed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[140px] h-11 bg-muted/30 border-border/50">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  {(statusFilter !== 'all' || priorityFilter !== 'all') && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setStatusFilter('all');
                        setPriorityFilter('all');
                      }}
                      className="h-11"
                    >
                      Clear Filters
                    </Button>
                  )}
            </div>
          </div>

          <TabsContent value="list" className="mt-0">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">
                  All Deliveries ({filteredDeliveries.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold text-foreground/90">Apartment</TableHead>
                        <TableHead className="font-semibold text-foreground/90">Vendor</TableHead>
                        <TableHead className="font-semibold text-foreground/90">Order No</TableHead>
                        <TableHead className="font-semibold text-foreground/90">Priority</TableHead>
                        <TableHead className="font-semibold text-foreground/90">ETA</TableHead>
                        <TableHead className="font-semibold text-foreground/90">Time Slot</TableHead>
                        <TableHead className="font-semibold text-foreground/90">Status</TableHead>
                        <TableHead className="font-semibold text-foreground/90">Tracking</TableHead>
                        <TableHead className="text-right font-semibold text-foreground/90">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDeliveries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8">
                            <p className="text-muted-foreground">No deliveries found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredDeliveries.map((delivery) => (
                          <TableRow key={delivery.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{delivery.apartment}</TableCell>
                            <TableCell className="text-muted-foreground">{delivery.vendor}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono">
                                {delivery.order_no}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getPriorityColor(delivery.priority)}>
                                {delivery.priority}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{delivery.eta}</TableCell>
                            <TableCell className="text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {delivery.time_slot}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getStatusColor(delivery.status)}>
                                {delivery.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono">
                                {delivery.tracking_number}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  title="View Details"
                                  onClick={() => {
                                    setSelectedDelivery(delivery);
                                    setDetailsOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  title="Track Delivery"
                                  onClick={() => {
                                    setSelectedDelivery(delivery);
                                    setTrackingOpen(true);
                                  }}
                                >
                                  <MapPinned className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  title="Update Status"
                                  onClick={() => {
                                    setSelectedDelivery(delivery);
                                    setStatusUpdateOpen(true);
                                  }}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="mt-0">
            <Card>
              <CardContent className="p-6">
                {/* Calendar Header */}
                <div className="grid grid-cols-7 gap-3 mb-3">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-3">
                  {Array.from({ length: 35 }, (_, i) => {
                    const today = new Date();
                    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    const dayOffset = startOfMonth.getDay();
                    const dayNumber = i - dayOffset + 1;
                    const currentDate = new Date(today.getFullYear(), today.getMonth(), dayNumber);
                    const dateKey = currentDate.toISOString().split('T')[0];
                    const dayDeliveries = filteredDeliveries.filter(d => d.eta === dateKey);
                    
                    if (i < dayOffset || dayNumber > new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()) {
                      return <div key={i} className="aspect-square" />;
                    }

                    return (
                      <div
                        key={i}
                        className={`aspect-square border rounded-lg p-2 hover:border-primary transition-colors ${
                          dayDeliveries.length > 0 ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'
                        }`}
                      >
                        <div className="text-sm font-medium mb-1">{dayNumber}</div>
                        {dayDeliveries.length > 0 && (
                          <div className="space-y-1">
                            {dayDeliveries.slice(0, 2).map(d => (
                              <div
                                key={d.id}
                                className={`text-[10px] px-1 py-0.5 rounded truncate ${getStatusColor(d.status)}`}
                              >
                                {d.apartment.split(' ')[0]}
                              </div>
                            ))}
                            {dayDeliveries.length > 2 && (
                              <div className="text-[10px] text-muted-foreground">+{dayDeliveries.length - 2}</div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <DeliveryDetails
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          delivery={selectedDelivery}
        />
        <DeliveryStatusUpdate
          open={statusUpdateOpen}
          onOpenChange={setStatusUpdateOpen}
          delivery={selectedDelivery}
          onStatusUpdate={handleStatusUpdate}
        />
        <DeliveryTracking
          open={trackingOpen}
          onOpenChange={setTrackingOpen}
          delivery={selectedDelivery}
        />
      </div>
    </PageLayout>
  );
};

export default Deliveries;
