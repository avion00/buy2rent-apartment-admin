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
  RefreshCw
} from 'lucide-react';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDashboardOverview, useDashboardRecentActivities } from '@/hooks/useDashboardApi';

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
  
  // Use API data or fallback
  const kpi = dashboardData?.kpi;
  const ordersData = dashboardData?.orders_chart || fallbackOrdersData;
  const spendingData = dashboardData?.spending_chart || fallbackSpendingData;
  
  // Recent activities for tasks section
  const recentOrders = recentData?.recent_orders || [];
  const recentIssues = recentData?.recent_issues || [];
  const recentPayments = recentData?.recent_payments || [];
  
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
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Recent Orders
                </CardTitle>
                <Badge variant="outline">{recentOrders.length} orders</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent orders</p>
                ) : (
                  recentOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-start justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{order.po_number}</Badge>
                          <Badge 
                            variant={order.status === 'delivered' ? 'default' : order.status === 'processing' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{order.apartment}</p>
                        <p className="text-xs text-muted-foreground">{order.vendor} • {order.total.toLocaleString()} Ft</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Recent Payments
                </CardTitle>
                <Badge variant="outline">{recentPayments.length} payments</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentPayments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent payments</p>
                ) : (
                  recentPayments.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <CreditCard className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{payment.order_reference}</p>
                          <Badge 
                            variant={payment.status === 'Paid' ? 'default' : payment.status === 'Partial' ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {payment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{payment.vendor || 'Unknown vendor'}</p>
                        <p className="text-xs text-muted-foreground">
                          {payment.amount_paid.toLocaleString()} / {payment.total_amount.toLocaleString()} Ft
                        </p>
                      </div>
                    </div>
                  ))
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
