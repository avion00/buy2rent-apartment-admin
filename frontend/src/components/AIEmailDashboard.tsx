import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Bot,
  Mail,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Zap,
  Settings,
  RefreshCw,
} from 'lucide-react';
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

interface PendingApproval {
  id: string;
  issue_id: string;
  issue_type: string;
  vendor: string;
  apartment: string | null;
  subject: string;
  to_email: string;
  message_preview: string;
  ai_confidence: number;
  created_at: string;
  priority: string;
}

interface EmailThread {
  issue_id: string;
  issue_type: string;
  vendor: string;
  email_count: number;
  last_sender: string;
  last_subject: string;
  last_timestamp: string;
  status: string;
  has_pending: boolean;
}

interface AIEmailStats {
  total_ai_issues: number;
  total_emails: number;
  pending_approvals: number;
  emails_sent_today: number;
  vendor_responses_today: number;
  ai_emails_last_7_days: number;
  avg_confidence: number;
}

export const AIEmailDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [emailThreads, setEmailThreads] = useState<EmailThread[]>([]);
  const [stats, setStats] = useState<AIEmailStats | null>(null);
  const [autoApprovalEnabled, setAutoApprovalEnabled] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.8);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [approving, setApproving] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/ai-email/');
      setPendingApprovals(response.data.pending_approvals || []);
      setEmailThreads(response.data.active_threads || []);
      setStats(response.data.statistics || null);
      setAutoApprovalEnabled(response.data.auto_approval?.enabled || false);
      setConfidenceThreshold(response.data.auto_approval?.confidence_threshold || 0.8);
    } catch (error) {
      console.error('Failed to fetch AI email dashboard:', error);
      toast.error('Failed to load AI email dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleApproveSelected = async () => {
    if (selectedMessages.size === 0) {
      toast.warning('Please select messages to approve');
      return;
    }

    setApproving(true);
    try {
      const response = await api.post('/dashboard/ai-email/approve/', {
        message_ids: Array.from(selectedMessages),
      });
      toast.success(`Approved ${response.data.approved} messages`);
      setSelectedMessages(new Set());
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to approve messages');
    } finally {
      setApproving(false);
    }
  };

  const handleApproveAll = async () => {
    if (pendingApprovals.length === 0) return;

    setApproving(true);
    try {
      const response = await api.post('/dashboard/ai-email/approve/', {
        approve_all: true,
      });
      toast.success(`Approved ${response.data.approved} messages`);
      setSelectedMessages(new Set());
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to approve all messages');
    } finally {
      setApproving(false);
    }
  };

  const toggleMessageSelection = (id: string) => {
    const newSelection = new Set(selectedMessages);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedMessages(newSelection);
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) return <Badge className="bg-green-500">High ({Math.round(confidence * 100)}%)</Badge>;
    if (confidence >= 0.7) return <Badge className="bg-yellow-500">Medium ({Math.round(confidence * 100)}%)</Badge>;
    return <Badge className="bg-red-500">Low ({Math.round(confidence * 100)}%)</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500',
    };
    return <Badge className={colors[(priority || '').toLowerCase()] || 'bg-gray-500'}>{priority}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Active Issues</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_ai_issues || 0}</div>
            <p className="text-xs text-muted-foreground">Issues with AI email enabled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending_approvals || 0}</div>
            <p className="text-xs text-muted-foreground">Messages awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Today</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.emails_sent_today || 0}</div>
            <p className="text-xs text-muted-foreground">AI emails sent today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendor Responses</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.vendor_responses_today || 0}</div>
            <p className="text-xs text-muted-foreground">Responses received today</p>
          </CardContent>
        </Card>
      </div>

      {/* Auto-Approval Settings */}
      {autoApprovalEnabled && (
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription>
            Auto-approval is enabled for messages with confidence above {Math.round(confidenceThreshold * 100)}%
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Approvals
            {pendingApprovals.length > 0 && (
              <Badge className="ml-2" variant="destructive">
                {pendingApprovals.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="threads">Email Threads</TabsTrigger>
        </TabsList>

        {/* Pending Approvals Tab */}
        <TabsContent value="pending" className="space-y-4">
          {pendingApprovals.length > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  onClick={handleApproveSelected}
                  disabled={selectedMessages.size === 0 || approving}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve Selected ({selectedMessages.size})
                </Button>
                <Button
                  onClick={handleApproveAll}
                  disabled={approving}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve All
                </Button>
              </div>
              <Button onClick={fetchDashboardData} variant="ghost" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          )}

          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {pendingApprovals.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                    <p className="text-lg font-medium">No pending approvals</p>
                    <p className="text-sm text-muted-foreground">All AI-generated emails have been processed</p>
                  </CardContent>
                </Card>
              ) : (
                pendingApprovals.map((approval) => (
                  <Card
                    key={approval.id}
                    className={`cursor-pointer transition-colors ${
                      selectedMessages.has(approval.id) ? 'border-primary' : ''
                    }`}
                    onClick={() => toggleMessageSelection(approval.id)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="text-base">{approval.subject}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>To: {approval.to_email}</span>
                            <span>•</span>
                            <span>{approval.vendor}</span>
                            {approval.apartment && (
                              <>
                                <span>•</span>
                                <span>{approval.apartment}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(approval.priority)}
                          {getConfidenceBadge(approval.ai_confidence)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm">{approval.message_preview}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Issue: {approval.issue_type}</span>
                          <span>Created: {new Date(approval.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Email Threads Tab */}
        <TabsContent value="threads" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {emailThreads.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No active email threads</p>
                    <p className="text-sm text-muted-foreground">Start by creating an issue with AI email enabled</p>
                  </CardContent>
                </Card>
              ) : (
                emailThreads.map((thread) => (
                  <Card key={thread.issue_id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="text-base">{thread.issue_type}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{thread.vendor}</span>
                            <span>•</span>
                            <span>{thread.email_count} emails</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={thread.has_pending ? 'destructive' : 'secondary'}>
                            {thread.has_pending ? 'Has Pending' : thread.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Last:</span>
                          <Badge variant="outline">{thread.last_sender}</Badge>
                          <span className="text-muted-foreground">{thread.last_subject}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(thread.last_timestamp).toLocaleString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
