import { PageLayout } from '@/components/layout/PageLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building2, 
  Package, 
  AlertCircle, 
  Truck, 
  CreditCard,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const ordersData = [
  { month: 'Jun', ordered: 12, delivered: 10 },
  { month: 'Jul', ordered: 19, delivered: 15 },
  { month: 'Aug', ordered: 15, delivered: 18 },
  { month: 'Sep', ordered: 22, delivered: 20 },
  { month: 'Oct', ordered: 28, delivered: 25 },
  { month: 'Nov', ordered: 15, delivered: 8 },
];

const spendingData = [
  { month: 'Jun', amount: 12500 },
  { month: 'Jul', amount: 18200 },
  { month: 'Aug', amount: 15800 },
  { month: 'Sep', amount: 22100 },
  { month: 'Oct', amount: 28900 },
  { month: 'Nov', amount: 16500 },
];

const todaysTasks = [
  { id: 1, type: 'Delivery', title: 'IKEA delivery to Budapest Apt #A12', time: '9:00 AM', priority: 'high' },
  { id: 2, type: 'Approval', title: 'Approve replacement for dining chairs', time: '11:00 AM', priority: 'medium' },
  { id: 3, type: 'Payment', title: 'Process payment to Royalty Line', time: '2:00 PM', priority: 'high' },
  { id: 4, type: 'Delivery', title: 'Philips lighting delivery', time: '4:00 PM', priority: 'low' },
];

const aiActions = [
  { id: 1, action: 'Email sent to IKEA Hungary', details: 'Missing chair replacement request', time: '1 hour ago' },
  { id: 2, action: 'Payment reminder sent', details: 'Philips Lighting - Invoice INV-003', time: '3 hours ago' },
  { id: 3, action: 'Stock check completed', details: 'Wood Dining Table - In stock at vendor', time: '5 hours ago' },
];

const Overview = () => {
  return (
    <PageLayout title="Dashboard Overview">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard
            title="Active Apartments"
            value={14}
            icon={Building2}
            trend={{ value: 12, label: 'vs last month' }}
          />
          <KPICard
            title="Pending Orders"
            value={9}
            icon={Package}
            trend={{ value: -5, label: 'vs last week' }}
          />
          <KPICard
            title="Open Issues"
            value={6}
            icon={AlertCircle}
            trend={{ value: 0, label: 'no change' }}
          />
          <KPICard
            title="Deliveries This Week"
            value={12}
            icon={Truck}
            trend={{ value: 8, label: 'vs last week' }}
          />
          <KPICard
            title="Overdue Payments"
            value={3}
            icon={CreditCard}
            trend={{ value: -2, label: 'vs last month' }}
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

        {/* Tasks and AI Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Tasks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Today's Tasks
                </CardTitle>
                <Badge variant="outline">{todaysTasks.length} pending</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaysTasks.map((task) => (
                  <div key={task.id} className="flex items-start justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{task.type}</Badge>
                        <Badge 
                          variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.time}</p>
                    </div>
                    <Button size="sm" variant="ghost">View</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent AI Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent AI Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {aiActions.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{item.action}</p>
                      <p className="text-sm text-muted-foreground">{item.details}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                ))}
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
