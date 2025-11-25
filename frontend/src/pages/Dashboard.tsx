import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, TrendingUp, AlertCircle, CheckCircle, 
  Clock, DollarSign, ArrowRight, FileText 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const kpis = [
    {
      title: "Items Ordered",
      value: "68%",
      change: "+12%",
      trend: "up",
      icon: Package,
      color: "text-primary"
    },
    {
      title: "Delivered",
      value: "45%",
      change: "+8%",
      trend: "up",
      icon: CheckCircle,
      color: "text-success"
    },
    {
      title: "Total Spend",
      value: "$84,320",
      subtitle: "of $120,000",
      icon: DollarSign,
      color: "text-warning"
    },
    {
      title: "Open Issues",
      value: "12",
      change: "-3",
      trend: "down",
      icon: AlertCircle,
      color: "text-danger"
    },
    {
      title: "Pending Approvals",
      value: "5",
      icon: Clock,
      color: "text-muted-foreground"
    }
  ];

  const quickLinks = [
    { title: "Items Due Today", count: 8, href: "/products", color: "bg-primary/10 text-primary" },
    { title: "Overdue Payments", count: 3, href: "/payments", color: "bg-danger/10 text-danger" },
    { title: "Issues Stuck >48h", count: 4, href: "/issues", color: "bg-warning/10 text-warning" },
    { title: "New Upload Ready", count: 1, href: "/uploads", color: "bg-success/10 text-success" }
  ];

  const recentActivity = [
    { time: "10 mins ago", action: "Designer approved replacement for Sofa #A203", type: "approval" },
    { time: "1 hour ago", action: "5 items marked as delivered - Apartment 3B", type: "delivery" },
    { time: "2 hours ago", action: "Payment overdue: Vendor Ikea - Invoice #3421", type: "payment" },
    { time: "3 hours ago", action: "New issue opened: Damaged dining table", type: "issue" },
  ];

  return (
    <PageLayout title="Dashboard">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {kpis.map((kpi, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <p className="text-sm text-muted-foreground">{kpi.title}</p>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    {kpi.subtitle && (
                      <p className="text-xs text-muted-foreground">{kpi.subtitle}</p>
                    )}
                    {kpi.change && (
                      <Badge variant={kpi.trend === "up" ? "default" : "secondary"} className="text-xs">
                        {kpi.change}
                      </Badge>
                    )}
                  </div>
                  <kpi.icon className={`h-8 w-8 ${kpi.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Items that need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickLinks.map((link, index) => (
                <Link key={index} to={link.href}>
                  <div className={`p-4 rounded-lg ${link.color} hover:opacity-80 transition-opacity cursor-pointer`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{link.title}</p>
                        <p className="text-2xl font-bold mt-1">{link.count}</p>
                      </div>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates across all projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'approval' ? 'bg-primary/10' :
                      activity.type === 'delivery' ? 'bg-success/10' :
                      activity.type === 'payment' ? 'bg-danger/10' :
                      'bg-warning/10'
                    }`}>
                      {activity.type === 'approval' && <CheckCircle className="h-4 w-4 text-primary" />}
                      {activity.type === 'delivery' && <Package className="h-4 w-4 text-success" />}
                      {activity.type === 'payment' && <DollarSign className="h-4 w-4 text-danger" />}
                      {activity.type === 'issue' && <AlertCircle className="h-4 w-4 text-warning" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Activity
              </Button>
            </CardContent>
          </Card>

          {/* Project Status */}
          <Card>
            <CardHeader>
              <CardTitle>Active Projects</CardTitle>
              <CardDescription>Current apartment status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Apartment 3B", progress: 85, items: "42/50 items" },
                  { name: "Apartment 4A", progress: 60, items: "30/50 items" },
                  { name: "Apartment 5C", progress: 40, items: "20/50 items" },
                  { name: "Apartment 6D", progress: 20, items: "10/50 items" },
                ].map((project, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{project.name}</span>
                      <span className="text-muted-foreground">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary rounded-full h-2 transition-all" 
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{project.items}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
