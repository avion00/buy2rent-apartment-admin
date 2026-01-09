import React, { useEffect, useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Package, TrendingUp, AlertCircle, CheckCircle, 
  Clock, DollarSign, ArrowRight, FileText,
  Bot, Mail, Send, MessageSquare
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
import { toast } from 'sonner';

const DashboardWithAI = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [aiEmailStats, setAiEmailStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch main dashboard stats
      const statsResponse = await api.get('/dashboard/stats/');
      setDashboardData(statsResponse.data);
      
      // Fetch AI email stats
      const aiResponse = await api.get('/dashboard/ai-email/');
      setAiEmailStats(aiResponse.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const kpis = [
    {
      title: "Items Ordered",
      value: dashboardData?.orders?.total || 0,
      change: "+12%",
      trend: "up",
      icon: Package,
      color: "text-primary"
    },
    {
      title: "Delivered",
      value: dashboardData?.deliveries?.delivered || 0,
      change: "+8%",
      trend: "up",
      icon: CheckCircle,
      color: "text-success"
    },
    {
      title: "Total Spend",
      value: `$${(dashboardData?.payments?.total_amount || 0).toLocaleString()}`,
      subtitle: `of $${(dashboardData?.apartments?.total_budget || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "text-warning"
    },
    {
      title: "Open Issues",
      value: dashboardData?.issues?.open || 0,
      change: dashboardData?.issues?.critical > 0 ? `${dashboardData.issues.critical} critical` : null,
      trend: dashboardData?.issues?.critical > 0 ? "alert" : "stable",
      icon: AlertCircle,
      color: "text-danger"
    },
    {
      title: "AI Email Pending",
      value: aiEmailStats?.statistics?.pending_approvals || 0,
      subtitle: aiEmailStats?.statistics?.pending_approvals > 0 ? "Need approval" : "All clear",
      icon: Bot,
      color: aiEmailStats?.statistics?.pending_approvals > 0 ? "text-yellow-500" : "text-green-500",
      action: () => navigate('/issues?tab=ai-email')
    }
  ];

  const aiMetrics = [
    {
      label: "AI Active Issues",
      value: aiEmailStats?.statistics?.total_ai_issues || 0,
      icon: Bot
    },
    {
      label: "Emails Sent Today",
      value: aiEmailStats?.statistics?.emails_sent_today || 0,
      icon: Send
    },
    {
      label: "Vendor Responses",
      value: aiEmailStats?.statistics?.vendor_responses_today || 0,
      icon: MessageSquare
    },
    {
      label: "Avg AI Confidence",
      value: `${Math.round((aiEmailStats?.statistics?.avg_confidence || 0) * 100)}%`,
      icon: TrendingUp
    }
  ];

  const recentActivities = [
    {
      type: "ai_email",
      title: "AI Email Sent",
      description: "Quality issue reported to vendor",
      time: "2 minutes ago",
      icon: Bot,
      color: "text-primary"
    },
    {
      type: "vendor_response",
      title: "Vendor Response Received",
      description: "Response analyzed, AI reply pending",
      time: "15 minutes ago",
      icon: Mail,
      color: "text-blue-500"
    },
    {
      type: "approval",
      title: "Email Approved",
      description: "AI-generated response sent to vendor",
      time: "1 hour ago",
      icon: CheckCircle,
      color: "text-green-500"
    }
  ];

  if (loading) {
    return (
      <PageLayout title="Dashboard" description="Overview of your procurement operations">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Dashboard" description="Overview of your procurement operations">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {kpis.map((kpi, index) => (
            <Card 
              key={index} 
              className={`cursor-pointer hover:shadow-lg transition-shadow ${kpi.action ? 'cursor-pointer' : ''}`}
              onClick={kpi.action}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {kpi.title}
                </CardTitle>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                {kpi.subtitle && (
                  <p className="text-xs text-muted-foreground">
                    {kpi.subtitle}
                  </p>
                )}
                {kpi.change && (
                  <p className={`text-xs ${kpi.trend === 'up' ? 'text-green-500' : kpi.trend === 'alert' ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {kpi.change}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Email Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <CardTitle>AI Email Management</CardTitle>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/issues?tab=ai-email')}
              >
                View Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              Automated vendor communication powered by AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {aiMetrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <metric.icon className="h-4 w-4" />
                    <span>{metric.label}</span>
                  </div>
                  <div className="text-2xl font-bold">{metric.value}</div>
                </div>
              ))}
            </div>
            
            {aiEmailStats?.statistics?.pending_approvals > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium">
                      {aiEmailStats.statistics.pending_approvals} emails pending approval
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-yellow-600 hover:bg-yellow-700"
                    onClick={() => navigate('/issues?tab=ai-email')}
                  >
                    Review Now
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          {/* Recent Activities */}
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                Latest updates across your procurement system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`rounded-full p-2 ${
                      activity.type === 'ai_email' ? 'bg-primary/10' :
                      activity.type === 'vendor_response' ? 'bg-blue-100' :
                      'bg-green-100'
                    }`}>
                      <activity.icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and workflows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/issues/new')}
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                Report New Issue
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/orders/new')}
              >
                <Package className="mr-2 h-4 w-4" />
                Create Order
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/issues?tab=ai-email')}
              >
                <Bot className="mr-2 h-4 w-4" />
                Review AI Emails
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/payments')}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Process Payments
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/reports')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Generate Reports
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
            <CardDescription>
              Overall completion across all apartments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Items Ordered</span>
                <span className="font-medium">68%</span>
              </div>
              <Progress value={68} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Items Delivered</span>
                <span className="font-medium">45%</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Issues Resolved</span>
                <span className="font-medium">
                  {dashboardData?.issues?.closed || 0} / {dashboardData?.issues?.total || 0}
                </span>
              </div>
              <Progress 
                value={dashboardData?.issues?.total > 0 
                  ? (dashboardData?.issues?.closed / dashboardData?.issues?.total) * 100 
                  : 0} 
                className="h-2" 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>AI Email Automation</span>
                <span className="font-medium">
                  {aiEmailStats?.statistics?.total_ai_issues || 0} active
                </span>
              </div>
              <Progress 
                value={dashboardData?.issues?.total > 0 
                  ? (aiEmailStats?.statistics?.total_ai_issues / dashboardData?.issues?.total) * 100 
                  : 0} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default DashboardWithAI;
