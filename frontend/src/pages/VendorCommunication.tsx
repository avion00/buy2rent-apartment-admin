import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Send, 
  Bot, 
  User, 
  Mail,
  AlertTriangle,
  TrendingUp,
  Activity,
  PauseCircle,
  PlayCircle,
  Edit,
  Check,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface VendorIssue {
  id: string;
  vendor_name: string;
  title: string;
  issue_type: string;
  status: string;
  priority: string;
  detected_at: string;
  has_conversation: boolean;
}

interface EmailMessage {
  id: string;
  subject: string;
  sender_type: string;
  sender_email: string;
  body_text: string;
  status: string;
  ai_generated: boolean;
  ai_confidence: number;
  created_at: string;
  sent_at: string;
}

interface Conversation {
  id: string;
  subject: string;
  vendor_name: string;
  status: string;
  control_mode: string;
  ai_enabled: boolean;
  message_count: number;
  last_activity: string;
}

interface DashboardStats {
  total_issues: number;
  active_conversations: number;
  pending_approvals: number;
  resolved_today: number;
  ai_success_rate: number;
  average_resolution_time: number;
}

export default function VendorCommunication() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [issues, setIssues] = useState<VendorIssue[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [showNewIssueDialog, setShowNewIssueDialog] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<EmailMessage[]>([]);
  
  // Form state for new issue
  const [newIssue, setNewIssue] = useState({
    vendor_id: '',
    issue_type: 'defect',
    priority: 'medium',
    title: '',
    description: '',
    auto_send: true
  });

  useEffect(() => {
    fetchDashboardStats();
    fetchIssues();
    fetchConversations();
    fetchPendingMessages();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/api/vendor-communication/stats/overview/');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchIssues = async () => {
    try {
      const response = await api.get('/api/vendor-communication/issues/');
      setIssues(response.data);
    } catch (error) {
      console.error('Error fetching issues:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get('/api/vendor-communication/conversations/');
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchPendingMessages = async () => {
    try {
      const response = await api.get('/api/vendor-communication/messages/?pending_approval=true');
      setPendingMessages(response.data);
    } catch (error) {
      console.error('Error fetching pending messages:', error);
    }
  };

  const fetchConversationMessages = async (conversationId: string) => {
    try {
      const response = await api.get(`/api/vendor-communication/conversations/${conversationId}/messages/`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleReportIssue = async () => {
    setLoading(true);
    try {
      const response = await api.post('/api/vendor-communication/issues/report_issue/', newIssue);
      if (response.data.success) {
        toast.success('Issue reported successfully');
        setShowNewIssueDialog(false);
        fetchIssues();
        fetchConversations();
        setNewIssue({
          vendor_id: '',
          issue_type: 'defect',
          priority: 'medium',
          title: '',
          description: '',
          auto_send: true
        });
      }
    } catch (error) {
      toast.error('Failed to report issue');
    } finally {
      setLoading(false);
    }
  };

  const handleTakeControl = async (conversationId: string) => {
    try {
      await api.post(`/api/vendor-communication/conversations/${conversationId}/take_control/`, {
        notes: 'Manual intervention required'
      });
      toast.success('Manual control activated');
      fetchConversations();
    } catch (error) {
      toast.error('Failed to take control');
    }
  };

  const handleResumeAI = async (conversationId: string) => {
    try {
      await api.post(`/api/vendor-communication/conversations/${conversationId}/resume_ai/`, {
        supervised: true
      });
      toast.success('AI control resumed');
      fetchConversations();
    } catch (error) {
      toast.error('Failed to resume AI control');
    }
  };

  const handleApproveMessage = async (messageId: string) => {
    try {
      await api.post(`/api/vendor-communication/messages/${messageId}/approve/`, {
        send_immediately: true
      });
      toast.success('Message approved and sent');
      fetchPendingMessages();
      if (selectedConversation) {
        fetchConversationMessages(selectedConversation.id);
      }
    } catch (error) {
      toast.error('Failed to approve message');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; icon: any }> = {
      active: { variant: 'default', icon: Activity },
      resolved: { variant: 'success', icon: CheckCircle },
      escalated: { variant: 'destructive', icon: AlertTriangle },
      paused: { variant: 'secondary', icon: PauseCircle }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, any> = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'secondary',
      low: 'outline'
    };
    
    return <Badge variant={variants[priority] || 'outline'}>{priority}</Badge>;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Vendor Communication</h1>
          <p className="text-muted-foreground">AI-powered email conversations with vendors</p>
        </div>
        <Dialog open={showNewIssueDialog} onOpenChange={setShowNewIssueDialog}>
          <DialogTrigger asChild>
            <Button>
              <AlertCircle className="mr-2 h-4 w-4" />
              Report Issue
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Report Vendor Issue</DialogTitle>
              <DialogDescription>
                Create a new issue and start an AI-powered conversation with the vendor
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="vendor">Vendor</Label>
                <Select value={newIssue.vendor_id} onValueChange={(value) => setNewIssue({...newIssue, vendor_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Vendor options would be loaded from API */}
                    <SelectItem value="vendor1">Vendor 1</SelectItem>
                    <SelectItem value="vendor2">Vendor 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="issue_type">Issue Type</Label>
                  <Select value={newIssue.issue_type} onValueChange={(value) => setNewIssue({...newIssue, issue_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="defect">Product Defect</SelectItem>
                      <SelectItem value="mismatch">Product Mismatch</SelectItem>
                      <SelectItem value="delay">Delivery Delay</SelectItem>
                      <SelectItem value="quality">Quality Issue</SelectItem>
                      <SelectItem value="quantity">Quantity Issue</SelectItem>
                      <SelectItem value="damage">Damage in Transit</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newIssue.priority} onValueChange={(value) => setNewIssue({...newIssue, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newIssue.title}
                  onChange={(e) => setNewIssue({...newIssue, title: e.target.value})}
                  placeholder="Brief description of the issue"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newIssue.description}
                  onChange={(e) => setNewIssue({...newIssue, description: e.target.value})}
                  placeholder="Detailed description of the issue..."
                  rows={4}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto_send"
                  checked={newIssue.auto_send}
                  onChange={(e) => setNewIssue({...newIssue, auto_send: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="auto_send" className="text-sm font-normal">
                  Automatically send AI-generated email to vendor
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewIssueDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleReportIssue} disabled={loading}>
                {loading ? 'Creating...' : 'Report Issue'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_issues}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_conversations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending_approvals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resolved_today}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.ai_success_rate.toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.average_resolution_time.toFixed(1)}h</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
          <TabsTrigger value="issues">All Issues</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Conversations */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Conversations</CardTitle>
                <CardDescription>Latest vendor email threads</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {conversations.slice(0, 5).map((conv) => (
                      <div
                        key={conv.id}
                        className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-accent"
                        onClick={() => {
                          setSelectedConversation(conv);
                          fetchConversationMessages(conv.id);
                          setActiveTab('conversations');
                        }}
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{conv.vendor_name}</p>
                          <p className="text-xs text-muted-foreground">{conv.subject}</p>
                          <div className="flex gap-2">
                            {getStatusBadge(conv.status)}
                            {conv.ai_enabled ? (
                              <Badge variant="outline" className="gap-1">
                                <Bot className="h-3 w-3" />
                                AI
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1">
                                <User className="h-3 w-3" />
                                Manual
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {new Date(conv.last_activity).toLocaleDateString()}
                          </p>
                          <p className="text-sm font-medium">{conv.message_count} messages</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Recent Issues */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Issues</CardTitle>
                <CardDescription>Latest reported vendor issues</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {issues.slice(0, 5).map((issue) => (
                      <div key={issue.id} className="p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">{issue.title}</p>
                          {getPriorityBadge(issue.priority)}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{issue.vendor_name}</p>
                        <div className="flex gap-2">
                          {getStatusBadge(issue.status)}
                          <Badge variant="outline">{issue.issue_type}</Badge>
                          {issue.has_conversation && (
                            <Badge variant="outline" className="gap-1">
                              <Mail className="h-3 w-3" />
                              Email Thread
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conversations Tab */}
        <TabsContent value="conversations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Conversation List */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Conversations</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2">
                    {conversations.map((conv) => (
                      <div
                        key={conv.id}
                        className={`p-3 rounded-lg border cursor-pointer hover:bg-accent ${
                          selectedConversation?.id === conv.id ? 'bg-accent' : ''
                        }`}
                        onClick={() => {
                          setSelectedConversation(conv);
                          fetchConversationMessages(conv.id);
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium">{conv.vendor_name}</p>
                          {getStatusBadge(conv.status)}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {conv.subject}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="gap-1">
                            {conv.ai_enabled ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
                            {conv.control_mode}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {conv.message_count} msgs
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Conversation Detail */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {selectedConversation ? selectedConversation.subject : 'Select a conversation'}
                    </CardTitle>
                    {selectedConversation && (
                      <CardDescription>{selectedConversation.vendor_name}</CardDescription>
                    )}
                  </div>
                  {selectedConversation && (
                    <div className="flex gap-2">
                      {selectedConversation.ai_enabled ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTakeControl(selectedConversation.id)}
                        >
                          <PauseCircle className="mr-2 h-4 w-4" />
                          Take Control
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResumeAI(selectedConversation.id)}
                        >
                          <PlayCircle className="mr-2 h-4 w-4" />
                          Resume AI
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {selectedConversation ? (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender_type === 'vendor' ? 'justify-start' : 'justify-end'
                          }`}
                        >
                          <div
                            className={`max-w-[70%] p-4 rounded-lg ${
                              message.sender_type === 'vendor'
                                ? 'bg-muted'
                                : 'bg-primary text-primary-foreground'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback>
                                  {message.sender_type === 'vendor' ? 'V' : 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <p className="text-xs font-medium">
                                {message.sender_email}
                              </p>
                              {message.ai_generated && (
                                <Badge variant="outline" className="gap-1 text-xs">
                                  <Bot className="h-3 w-3" />
                                  AI ({(message.ai_confidence * 100).toFixed(0)}%)
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{message.body_text}</p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs opacity-70">
                                {new Date(message.created_at).toLocaleString()}
                              </p>
                              {message.status === 'pending_approval' && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleApproveMessage(message.id)}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex items-center justify-center h-[500px] text-muted-foreground">
                    Select a conversation to view messages
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pending Approvals Tab */}
        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>AI-generated messages waiting for approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingMessages.length > 0 ? (
                  pendingMessages.map((message) => (
                    <Card key={message.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">{message.subject}</CardTitle>
                            <CardDescription>To: {message.sender_email}</CardDescription>
                          </div>
                          <Badge variant="outline" className="gap-1">
                            <Bot className="h-3 w-3" />
                            AI Confidence: {(message.ai_confidence * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="p-4 bg-muted rounded-lg mb-4">
                          <p className="text-sm whitespace-pre-wrap">{message.body_text}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => handleApproveMessage(message.id)}>
                            <Check className="mr-2 h-4 w-4" />
                            Approve & Send
                          </Button>
                          <Button variant="outline">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button variant="outline">
                            <X className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No messages pending approval
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Issues</CardTitle>
              <CardDescription>Complete list of vendor issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {issues.map((issue) => (
                  <div key={issue.id} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">{issue.title}</h3>
                      <div className="flex gap-2">
                        {getPriorityBadge(issue.priority)}
                        {getStatusBadge(issue.status)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{issue.vendor_name}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Badge variant="outline">{issue.issue_type}</Badge>
                        {issue.has_conversation && (
                          <Badge variant="outline" className="gap-1">
                            <Mail className="h-3 w-3" />
                            Has Conversation
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Detected: {new Date(issue.detected_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
