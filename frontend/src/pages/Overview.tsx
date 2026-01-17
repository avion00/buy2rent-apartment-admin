import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, 
  Package, 
  AlertCircle, 
  Truck, 
  CreditCard,
  TrendingUp,
  Calendar,
  RefreshCw,
  Store,
  MapPin,
  DollarSign,
  Hash
} from 'lucide-react';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDashboardOverview, useDashboardRecentActivities } from '@/hooks/useDashboardApi';
import { format } from 'date-fns';

// Fallback data when API fails
const fallbackOrdersData = [
  { month: 'Jun', ordered: 0, delivered: 0 },
  { month: 'Jul', ordered: 0, delivered: 0 },
  { month: 'Aug', ordered: 0, delivered: 0 },
  { month: 'Sep', ordered: 0, delivered: 0 },
  { month: 'Oct', ordered: 0, delivered: 0 },
  { month: 'Nov', ordered: 0, delivered: 0 },
];

const fallbackSpendingData = [
  { month: 'Jun', amount: 0 },
  { month: 'Jul', amount: 0 },
  { month: 'Aug', amount: 0 },
  { month: 'Sep', amount: 0 },
  { month: 'Oct', amount: 0 },
  { month: 'Nov', amount: 0 },
];

const Overview = () => {
  const { data: dashboardData, isLoading, refetch } = useDashboardOverview();
  const { data: recentData } = useDashboardRecentActivities();
  const [hoveredOrderId, setHoveredOrderId] = useState<string | null>(null);
  const [clickedOrderId, setClickedOrderId] = useState<string | null>(null);
  const [hoveredPaymentId, setHoveredPaymentId] = useState<string | null>(null);
  const [clickedPaymentId, setClickedPaymentId] = useState<string | null>(null);
  
  // Use API data or fallback
  const kpi = dashboardData?.kpi;
  const ordersData = dashboardData?.orders_chart || fallbackOrdersData;
  const spendingData = dashboardData?.spending_chart || fallbackSpendingData;
  
  // Recent activities for tasks section
  const recentOrders = recentData?.recent_orders || [];
  const recentIssues = recentData?.recent_issues || [];
  const recentPayments = recentData?.recent_payments || [];
  
  // Debug logging
  console.log('Recent Data:', recentData);
  console.log('Recent Orders:', recentOrders);
  
  // Loading skeleton
  if (isLoading) {
    return (
      <PageLayout title="Dashboard Overview">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card><CardContent className="p-6"><Skeleton className="h-[300px] w-full" /></CardContent></Card>
            <Card><CardContent className="p-6"><Skeleton className="h-[300px] w-full" /></CardContent></Card>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout title="Dashboard Overview">
      <div className="space-y-6">
        
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard
            title="Active Apartments"
            value={kpi?.active_apartments?.value ?? 0}
            icon={Building2}
            trend={{ 
              value: kpi?.active_apartments?.trend ?? 0, 
              label: kpi?.active_apartments?.trend_label ?? 'vs last month' 
            }}
          />
          <KPICard
            title="Pending Orders"
            value={kpi?.pending_orders?.value ?? 0}
            icon={Package}
            trend={{ 
              value: kpi?.pending_orders?.trend ?? 0, 
              label: kpi?.pending_orders?.trend_label ?? 'vs last week' 
            }}
          />
          <KPICard
            title="Open Issues"
            value={kpi?.open_issues?.value ?? 0}
            icon={AlertCircle}
            trend={{ 
              value: kpi?.open_issues?.trend ?? 0, 
              label: kpi?.open_issues?.trend_label ?? 'no change' 
            }}
          />
          <KPICard
            title="Deliveries This Week"
            value={kpi?.deliveries_this_week?.value ?? 0}
            icon={Truck}
            trend={{ 
              value: kpi?.deliveries_this_week?.trend ?? 0, 
              label: kpi?.deliveries_this_week?.trend_label ?? 'vs last week' 
            }}
          />
          <KPICard
            title="Overdue Payments"
            value={kpi?.overdue_payments?.value ?? 0}
            icon={CreditCard}
            trend={{ 
              value: kpi?.overdue_payments?.trend ?? 0, 
              label: kpi?.overdue_payments?.trend_label ?? 'vs last month' 
            }}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Orders Chart */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">Orders Placed vs Delivered</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              <ChartContainer
                config={{
                  ordered: { label: "ordered", color: "hsl(var(--primary))" },
                  delivered: { label: "delivered", color: "hsl(var(--success))" }
                }}
                className="h-[280px] sm:h-[320px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={ordersData} 
                    margin={{ top: 10, right: 5, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 11 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend 
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                      iconSize={10}
                    />
                    <Bar dataKey="ordered" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="delivered" fill="hsl(var(--success))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Spending Trend */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">Total Spending Trend</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              <ChartContainer
                config={{
                  amount: { label: "Amount (€)", color: "hsl(var(--primary))" }
                }}
                className="h-[280px] sm:h-[320px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={spendingData} 
                    margin={{ top: 10, right: 5, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 11 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders and Payments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-gradient-to-r from-background to-muted/20">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <span>Recent Orders</span>
                </CardTitle>
                <Badge variant="secondary" className="font-semibold">
                  {recentOrders.length} orders
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {recentOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-4 rounded-full bg-muted/50 mb-3">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">No recent orders</p>
                    <p className="text-xs text-muted-foreground mt-1">Orders will appear here once placed</p>
                  </div>
                ) : (
                  recentOrders.slice(0, 5).map((order) => {
                    const isClicked = clickedOrderId === order.id;
                    const isHovered = hoveredOrderId === order.id;
                    const isExpanded = isClicked || isHovered;
                    
                    return (
                      <div 
                        key={order.id} 
                        className={`
                          group relative rounded-xl border-2
                          transition-all duration-500 ease-out cursor-pointer
                          ${isExpanded 
                            ? 'bg-gradient-to-br from-primary/5 via-primary/3 to-background shadow-xl border-primary/30' 
                            : 'bg-card/50 hover:bg-card border-border/50 hover:border-border hover:shadow-md'
                          }
                        `}
                        onMouseEnter={() => !isClicked && setHoveredOrderId(order.id)}
                        onMouseLeave={() => !isClicked && setHoveredOrderId(null)}
                        onClick={() => setClickedOrderId(isClicked ? null : order.id)}
                      >
                        {/* Decorative gradient overlay on hover */}
                        <div className={`
                          absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 transition-opacity duration-500 pointer-events-none rounded-xl
                          ${isExpanded ? 'opacity-100' : ''}
                        `} />
                        
                        {/* Main Content - Compact View */}
                        <div className="relative p-4">
                          <div className="flex items-center justify-between gap-4">
                            {/* Left: PO Number & Status */}
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className={`
                                p-2 rounded-lg transition-all duration-300
                                ${isExpanded ? 'bg-primary/15' : 'bg-muted/60'}
                              `}>
                                <Hash className={`h-4 w-4 transition-colors ${isExpanded ? 'text-primary' : 'text-muted-foreground'}`} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs font-bold transition-all ${isExpanded ? 'border-primary/50 bg-primary/5' : ''}`}
                                  >
                                    {order.po_number}
                                  </Badge>
                                  <Badge 
                                    variant={
                                      order.status === 'delivered' ? 'default' : 
                                      order.status === 'sent' ? 'secondary' : 
                                      order.status === 'cancelled' ? 'destructive' : 
                                      'outline'
                                    }
                                    className="text-xs capitalize"
                                  >
                                    {order.status}
                                  </Badge>
                                </div>
                                <p className="text-sm font-semibold text-foreground truncate">{order.apartment}</p>
                              </div>
                            </div>
                            
                            {/* Right: Total Amount */}
                            <div className="text-right flex-shrink-0">
                              <p className={`text-base font-bold transition-colors ${isExpanded ? 'text-primary' : 'text-foreground'}`}>
                                {order.total.toLocaleString()} Ft
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Expanded Details on Hover/Click */}
                        <div className={`
                          transition-all duration-500 ease-out overflow-hidden
                          ${isExpanded ? 'max-h-[600px]' : 'max-h-0'}
                        `}>
                          <div className="overflow-visible">
                            <div className="px-4 pb-4 pt-2 border-t border-border/50 bg-gradient-to-b from-muted/20 via-muted/5 to-transparent">
                              {/* Detailed Information Grid */}
                              <div className="grid grid-cols-3 gap-3 mb-4 mt-3">
                                {/* Order ID */}
                                <div className="space-y-1.5 p-3 rounded-lg bg-background/60 border border-border/50">
                                  <div className="flex items-center gap-1.5">
                                    <Hash className="h-3.5 w-3.5 text-primary" />
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Order ID</p>
                                  </div>
                                  <p className="text-xs font-mono font-medium text-foreground truncate" title={order.id}>
                                    {order.id.substring(0, 8)}...
                                  </p>
                                </div>
                                
                                {/* Apartment */}
                                <div className="space-y-1.5 p-3 rounded-lg bg-background/60 border border-border/50">
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-primary" />
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Apartment</p>
                                  </div>
                                  <p className="text-xs font-medium text-foreground truncate" title={order.apartment}>
                                    {order.apartment}
                                  </p>
                                </div>
                                
                                {/* Vendor */}
                                <div className="space-y-1.5 p-3 rounded-lg bg-background/60 border border-border/50">
                                  <div className="flex items-center gap-1.5">
                                    <Store className="h-3.5 w-3.5 text-primary" />
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Vendor</p>
                                  </div>
                                  <p className="text-xs font-medium text-foreground truncate" title={order.vendor}>
                                    {order.vendor}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Additional Info Row */}
                              <div className="grid grid-cols-2 gap-3 mb-4">
                                {/* Placed Date */}
                                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-background/40 border border-border/30">
                                  <div className="p-1.5 rounded-md bg-primary/10">
                                    <Calendar className="h-3.5 w-3.5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Placed On</p>
                                    <p className="text-xs font-semibold text-foreground">
                                      {order.placed_on ? format(new Date(order.placed_on), 'MMM dd, yyyy') : 'N/A'}
                                    </p>
                                  </div>
                                </div>
                                
                                {/* Total Amount */}
                                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-background/40 border border-border/30">
                                  <div className="p-1.5 rounded-md bg-primary/10">
                                    <DollarSign className="h-3.5 w-3.5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Amount</p>
                                    <p className="text-xs font-bold text-primary">
                                      {order.total.toLocaleString()} Ft
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Products Section */}
                              {order.items && order.items.length > 0 && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 px-1">
                                    <div className="p-1 rounded bg-primary/10">
                                      <Package className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    <p className="text-xs font-bold text-foreground uppercase tracking-wide">
                                      Products ({order.items.length})
                                    </p>
                                  </div>
                                  <div className="space-y-2 max-h-[240px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'hsl(var(--primary) / 0.3) transparent' }}>
                                    {order.items.map((item, idx) => (
                                      <div 
                                        key={item.id} 
                                        className="flex items-center gap-3 p-2.5 rounded-lg bg-background/80 border border-border/40 hover:bg-background hover:border-primary/30 hover:shadow-sm transition-all duration-200"
                                      >
                                        {/* Product Image */}
                                        {item.product_image ? (
                                          <img 
                                            src={item.product_image} 
                                            alt={item.product_name}
                                            className="w-10 h-10 rounded-md object-cover flex-shrink-0 border-2 border-border/50"
                                          />
                                        ) : (
                                          <div className="w-10 h-10 rounded-md bg-muted/60 flex items-center justify-center flex-shrink-0 border-2 border-border/50">
                                            <Package className="w-5 h-5 text-muted-foreground" />
                                          </div>
                                        )}
                                        
                                        {/* Product Details */}
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-semibold text-foreground truncate leading-tight mb-1" title={item.product_name}>
                                            {item.product_name}
                                          </p>
                                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                            <span className="font-medium">Qty: <span className="text-foreground font-semibold">{item.quantity}</span></span>
                                            <span>•</span>
                                            <span className="font-medium">{item.unit_price.toLocaleString()} Ft/unit</span>
                                          </div>
                                        </div>
                                        
                                        {/* Item Total */}
                                        <div className="text-right flex-shrink-0">
                                          <p className="text-xs font-bold text-foreground">
                                            {(item.quantity * item.unit_price).toLocaleString()} Ft
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-gradient-to-r from-background to-muted/20">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <span>Recent Payments</span>
                </CardTitle>
                <Badge variant="secondary" className="font-semibold">
                  {recentPayments.length} payments
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {recentPayments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-4 rounded-full bg-muted/50 mb-3">
                      <CreditCard className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">No recent payments</p>
                    <p className="text-xs text-muted-foreground mt-1">Payments will appear here once made</p>
                  </div>
                ) : (
                  recentPayments.slice(0, 5).map((payment) => {
                    const isClicked = clickedPaymentId === payment.id;
                    const isHovered = hoveredPaymentId === payment.id;
                    const isExpanded = isClicked || isHovered;
                    
                    return (
                      <div 
                        key={payment.id} 
                        className={`
                          group relative rounded-xl border-2
                          transition-all duration-500 ease-out cursor-pointer
                          ${isExpanded 
                            ? 'bg-gradient-to-br from-primary/5 via-primary/3 to-background shadow-xl border-primary/30' 
                            : 'bg-card/50 hover:bg-card border-border/50 hover:border-border hover:shadow-md'
                          }
                        `}
                        onMouseEnter={() => !isClicked && setHoveredPaymentId(payment.id)}
                        onMouseLeave={() => !isClicked && setHoveredPaymentId(null)}
                        onClick={() => setClickedPaymentId(isClicked ? null : payment.id)}
                      >
                        {/* Decorative gradient overlay */}
                        <div className={`
                          absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 transition-opacity duration-500 pointer-events-none rounded-xl
                          ${isExpanded ? 'opacity-100' : ''}
                        `} />
                        
                        {/* Main Content - Compact View */}
                        <div className="relative p-4">
                          <div className="flex items-center justify-between gap-4">
                            {/* Left: Order Reference & Status */}
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className={`
                                p-2 rounded-lg transition-all duration-300
                                ${isExpanded ? 'bg-primary/15' : 'bg-muted/60'}
                              `}>
                                <CreditCard className={`h-4 w-4 transition-colors ${isExpanded ? 'text-primary' : 'text-muted-foreground'}`} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs font-bold transition-all ${isExpanded ? 'border-primary/50 bg-primary/5' : ''}`}
                                  >
                                    {payment.order_reference}
                                  </Badge>
                                  <Badge 
                                    variant={
                                      payment.status === 'Paid' ? 'default' : 
                                      payment.status === 'Partial' ? 'secondary' : 
                                      'destructive'
                                    }
                                    className="text-xs capitalize"
                                  >
                                    {payment.status}
                                  </Badge>
                                </div>
                                <p className="text-sm font-semibold text-foreground truncate">{payment.vendor || 'Unknown vendor'}</p>
                              </div>
                            </div>
                            
                            {/* Right: Amount */}
                            <div className="text-right flex-shrink-0">
                              <p className={`text-base font-bold transition-colors ${isExpanded ? 'text-primary' : 'text-foreground'}`}>
                                {payment.amount_paid.toLocaleString()} Ft
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                of {payment.total_amount.toLocaleString()} Ft
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Expanded Details on Hover/Click */}
                        <div className={`
                          transition-all duration-500 ease-out overflow-hidden
                          ${isExpanded ? 'max-h-[600px]' : 'max-h-0'}
                        `}>
                          <div className="overflow-visible">
                            <div className="px-4 pb-4 pt-2 border-t border-border/50 bg-gradient-to-b from-muted/20 via-muted/5 to-transparent">
                              {/* Detailed Information Grid */}
                              <div className="grid grid-cols-3 gap-3 mb-4 mt-3">
                                {/* Payment ID */}
                                <div className="space-y-1.5 p-3 rounded-lg bg-background/60 border border-border/50">
                                  <div className="flex items-center gap-1.5">
                                    <Hash className="h-3.5 w-3.5 text-primary" />
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Payment ID</p>
                                  </div>
                                  <p className="text-xs font-mono font-medium text-foreground truncate" title={payment.id}>
                                    {payment.id.substring(0, 8)}...
                                  </p>
                                </div>
                                
                                {/* Order Reference */}
                                <div className="space-y-1.5 p-3 rounded-lg bg-background/60 border border-border/50">
                                  <div className="flex items-center gap-1.5">
                                    <Package className="h-3.5 w-3.5 text-primary" />
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Order Ref</p>
                                  </div>
                                  <p className="text-xs font-medium text-foreground truncate" title={payment.order_reference}>
                                    {payment.order_reference}
                                  </p>
                                </div>
                                
                                {/* Vendor */}
                                <div className="space-y-1.5 p-3 rounded-lg bg-background/60 border border-border/50">
                                  <div className="flex items-center gap-1.5">
                                    <Store className="h-3.5 w-3.5 text-primary" />
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Vendor</p>
                                  </div>
                                  <p className="text-xs font-medium text-foreground truncate" title={payment.vendor}>
                                    {payment.vendor || 'Unknown'}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Payment Details Row */}
                              <div className="grid grid-cols-2 gap-3 mb-4">
                                {/* Amount Paid */}
                                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-background/40 border border-border/30">
                                  <div className="p-1.5 rounded-md bg-primary/10">
                                    <DollarSign className="h-3.5 w-3.5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Amount Paid</p>
                                    <p className="text-xs font-bold text-primary">
                                      {payment.amount_paid.toLocaleString()} Ft
                                    </p>
                                  </div>
                                </div>
                                
                                {/* Total Amount */}
                                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-background/40 border border-border/30">
                                  <div className="p-1.5 rounded-md bg-primary/10">
                                    <DollarSign className="h-3.5 w-3.5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Amount</p>
                                    <p className="text-xs font-semibold text-foreground">
                                      {payment.total_amount.toLocaleString()} Ft
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Payment Progress Bar */}
                              <div className="space-y-2 p-3 rounded-lg bg-background/60 border border-border/50">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-semibold text-foreground">Payment Progress</p>
                                  <p className="text-xs font-bold text-primary">
                                    {Math.round((payment.amount_paid / payment.total_amount) * 100)}%
                                  </p>
                                </div>
                                <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                                    style={{ width: `${(payment.amount_paid / payment.total_amount) * 100}%` }}
                                  />
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                  <span>Paid: {payment.amount_paid.toLocaleString()} Ft</span>
                                  <span>Remaining: {(payment.total_amount - payment.amount_paid).toLocaleString()} Ft</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <ActivityFeed />
      </div>
    </PageLayout>
  );
};

export default Overview;
