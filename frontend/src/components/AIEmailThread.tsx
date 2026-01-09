import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Bot,
  User,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Mail,
  RefreshCw,
  Sparkles,
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

interface EmailMessage {
  id: string;
  sender: string;
  subject: string;
  message: string;
  timestamp: string;
  status: string;
  ai_generated: boolean;
  ai_confidence?: number;
  approved_by?: string;
  approved_at?: string;
}

interface AIEmailThreadProps {
  issueId: string;
  onClose?: () => void;
}

export const AIEmailThread: React.FC<AIEmailThreadProps> = ({ issueId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [aiActivated, setAiActivated] = useState(false);
  const [vendorMessage, setVendorMessage] = useState('');
  const [generatingReply, setGeneratingReply] = useState(false);
  const [messageMode, setMessageMode] = useState<'vendor' | 'manual'>('vendor');
  const [manualSubject, setManualSubject] = useState(`Re: Issue #${issueId}`);
  const [manualMessage, setManualMessage] = useState('');

  const fetchEmailThread = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/issues/${issueId}/email_thread/`);
      setMessages(response.data.messages || []);
      setAiActivated(response.data.ai_activated || false);
    } catch (error) {
      console.error('Failed to fetch email thread:', error);
      toast.error('Failed to load email thread');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailThread();
  }, [issueId]);

  const activateAIEmail = async () => {
    try {
      const response = await api.post(`/issues/${issueId}/activate_ai_email/`);
      if (response.data.success) {
        toast.success('AI email communication activated');
        fetchEmailThread();
      } else {
        toast.error(response.data.message || 'Failed to activate AI');
      }
    } catch (error) {
      toast.error('Failed to activate AI email');
    }
  };

  const generateAIReply = async () => {
    if (!vendorMessage.trim()) {
      toast.warning('Please enter the vendor message');
      return;
    }

    setGeneratingReply(true);
    try {
      const response = await api.post(`/issues/${issueId}/add_vendor_response/`, {
        message: vendorMessage,
        subject: `Re: Issue #${issueId}`,
        from_email: 'vendor@example.com'
      });
      
      if (response.data) {
        toast.success('Vendor response added and AI reply generated');
        setVendorMessage('');
        fetchEmailThread();
      } else {
        toast.error('Failed to add vendor response');
      }
    } catch (error) {
      toast.error('Failed to process vendor response');
    } finally {
      setGeneratingReply(false);
    }
  };

  const addVendorResponse = async () => {
    if (!vendorMessage.trim()) {
      toast.warning('Please enter the vendor message');
      return;
    }

    try {
      const response = await api.post(`/issues/${issueId}/add_vendor_response/`, {
        message: vendorMessage,
        subject: `Re: Issue #${issueId}`,
        from_email: 'vendor@example.com',
      });
      
      if (response.data.ai_reply?.success) {
        toast.success('Vendor response added and AI reply generated');
        setVendorMessage('');
        fetchEmailThread();
      }
    } catch (error) {
      toast.error('Failed to add vendor response');
    }
  };

  const sendManualMessage = async () => {
    if (!manualMessage.trim()) {
      toast.warning('Please enter a message');
      return;
    }

    try {
      const response = await api.post(`/issues/${issueId}/send_manual_message/`, {
        subject: manualSubject,
        message: manualMessage,
        to_email: messages.find(m => m.sender === 'Vendor')?.email_from || 'vendor@example.com',
      });

      if (response.data.success) {
        toast.success('Manual message sent successfully');
        setManualMessage('');
        setManualSubject(`Re: Issue #${issueId}`);
        fetchEmailThread();
      } else {
        toast.error(response.data.message || 'Failed to send message');
      }
    } catch (error) {
      toast.error('Failed to send manual message');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'pending_approval':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Mail className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSenderAvatar = (sender: string) => {
    if (sender === 'AI') {
      return (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      );
    }
    return (
      <Avatar className="h-8 w-8">
        <AvatarFallback>
          <User className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Email Conversation</h3>
          {aiActivated ? (
            <Badge className="bg-green-500">
              <Bot className="h-3 w-3 mr-1" />
              AI Active
            </Badge>
          ) : (
            <Badge variant="secondary">AI Inactive</Badge>
          )}
        </div>
        <div className="flex gap-2">
          {!aiActivated && (
            <Button onClick={activateAIEmail} size="sm" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Activate AI
            </Button>
          )}
          <Button onClick={fetchEmailThread} variant="ghost" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="h-[400px] border rounded-lg p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No email messages yet</p>
              {!aiActivated && (
                <p className="text-sm mt-2">Activate AI to start email communication</p>
              )}
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.sender === 'AI' ? 'justify-start' : 'justify-end'
                }`}
              >
                {message.sender === 'AI' && getSenderAvatar(message.sender)}
                <div
                  className={`max-w-[70%] space-y-2 ${
                    message.sender === 'AI' ? 'order-2' : 'order-1'
                  }`}
                >
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{message.sender}</span>
                          {message.ai_generated && (
                            <Badge variant="secondary" className="text-xs">
                              AI
                            </Badge>
                          )}
                          {getStatusIcon(message.status)}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{message.subject}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                      {message.ai_confidence && (
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Confidence: {Math.round(message.ai_confidence * 100)}%
                          </Badge>
                          {message.approved_by && (
                            <Badge variant="outline" className="text-xs">
                              Approved by {message.approved_by}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                {message.sender !== 'AI' && getSenderAvatar(message.sender)}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Add Vendor Response */}
      {aiActivated && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Compose Message</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={messageMode} onValueChange={(v) => setMessageMode(v as 'vendor' | 'manual')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="vendor">Add Vendor Response</TabsTrigger>
                <TabsTrigger value="manual">Send Manual Message</TabsTrigger>
              </TabsList>
              
              <TabsContent value="vendor" className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Vendor Response (paste email content here)
                  </label>
                  <Textarea
                    value={vendorMessage}
                    onChange={(e) => setVendorMessage(e.target.value)}
                    placeholder="Paste vendor's email response here..."
                    className="min-h-[100px]"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={generateAIReply}
                    disabled={generatingReply || !vendorMessage.trim()}
                    className="flex items-center gap-2"
                  >
                    {generatingReply ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Generating AI Reply...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate AI Reply
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={addVendorResponse}
                    variant="outline"
                    disabled={!vendorMessage.trim()}
                  >
                    Add Without AI
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="manual" className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Subject
                  </label>
                  <Input
                    value={manualSubject}
                    onChange={(e) => setManualSubject(e.target.value)}
                    placeholder="Email subject"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Message
                  </label>
                  <Textarea
                    value={manualMessage}
                    onChange={(e) => setManualMessage(e.target.value)}
                    placeholder="Type your message to vendor..."
                    className="min-h-[150px]"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={sendManualMessage}
                    disabled={!manualMessage.trim()}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send Manual Message
                  </Button>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Sends directly without AI processing</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
