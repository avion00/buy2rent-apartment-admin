import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
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
  Building2,
  MessageSquare,
  Paperclip,
  MoreVertical,
  ChevronDown,
  Reply,
  Forward,
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

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

interface EmailMessage {
  id: string;
  sender: string;
  subject: string;
  message: string;
  timestamp: string;
  status: string;
  ai_generated: boolean;
  ai_confidence?: number;
  email_from?: string;
  email_to?: string;
}

interface AIEmailThreadProps {
  issueId: string;
  issueDetails?: any;
  onClose?: () => void;
}

export const AIEmailThreadEnhanced: React.FC<AIEmailThreadProps> = ({ 
  issueId, 
  issueDetails,
  onClose 
}) => {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [aiActivated, setAiActivated] = useState(false);
  const [vendorMessage, setVendorMessage] = useState('');
  const [generatingReply, setGeneratingReply] = useState(false);
  const [messageMode, setMessageMode] = useState<'vendor' | 'manual'>('manual');
  const [manualMessage, setManualMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

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
        subject: 'Response to Your Message',
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

  const sendManualMessage = async () => {
    if (!manualMessage.trim()) {
      toast.warning('Please enter a message');
      return;
    }

    setSendingMessage(true);
    try {
      const response = await api.post(`/issues/${issueId}/send_manual_message/`, {
        message: manualMessage,
        to_email: messages.find(m => m.sender === 'Vendor')?.email_from || 'vendor@example.com',
      });

      if (response.data.success) {
        toast.success('Message sent successfully');
        setManualMessage('');
        fetchEmailThread();
      } else {
        toast.error(response.data.message || 'Failed to send message');
      }
    } catch (error) {
      toast.error('Failed to send manual message');
    } finally {
      setSendingMessage(false);
    }
  };

  const getSenderIcon = (sender: string) => {
    switch (sender) {
      case 'AI':
        return <Bot className="h-4 w-4" />;
      case 'Vendor':
        return <Building2 className="h-4 w-4" />;
      case 'Admin':
        return <User className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getSenderColor = (sender: string) => {
    switch (sender) {
      case 'AI':
        return 'bg-blue-500';
      case 'Vendor':
        return 'bg-purple-500';
      case 'Admin':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'MMM d, yyyy at h:mm a');
    } catch {
      return timestamp;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!aiActivated) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="rounded-full bg-muted p-6">
          <Bot className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">AI Email Not Activated</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Activate AI email to start automated vendor communication and view email threads
          </p>
        </div>
        <Button onClick={activateAIEmail} className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Activate AI Email Communication
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Header Section */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <span className="font-semibold">Email Thread</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {messages.length} messages
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-500 text-white">
            <Bot className="h-3 w-3 mr-1" />
            AI Active
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchEmailThread()}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Section */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No messages yet. Send the first message to start the conversation.</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={message.id} className="group">
                {index > 0 && <Separator className="my-4" />}
                <div className="space-y-3">
                  {/* Message Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className={`h-8 w-8 ${getSenderColor(message.sender)}`}>
                        <AvatarFallback className="bg-transparent text-white">
                          {getSenderIcon(message.sender)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{message.sender}</span>
                          {message.ai_generated && (
                            <Badge variant="secondary" className="text-xs">
                              AI Generated
                            </Badge>
                          )}
                          {message.ai_confidence && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                message.ai_confidence > 0.8 ? 'text-green-600' : 
                                message.ai_confidence > 0.6 ? 'text-yellow-600' : 
                                'text-red-600'
                              }`}
                            >
                              {Math.round(message.ai_confidence * 100)}% confidence
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(message.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="ml-11">
                    {message.subject && (
                      <div className="font-medium text-sm mb-2">{message.subject}</div>
                    )}
                    <div className="prose prose-sm max-w-none text-sm whitespace-pre-wrap bg-muted/50 rounded-lg p-4">
                      {message.message}
                    </div>
                    {message.status && (
                      <div className="flex items-center gap-2 mt-2">
                        {message.status === 'sent' && (
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Sent
                          </Badge>
                        )}
                        {message.status === 'pending_approval' && (
                          <Badge variant="outline" className="text-xs text-yellow-600">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending Approval
                          </Badge>
                        )}
                        {message.status === 'failed' && (
                          <Badge variant="outline" className="text-xs text-red-600">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Failed
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Compose Section */}
      <div className="border-t bg-background">
        <Tabs value={messageMode} onValueChange={(v) => setMessageMode(v as 'vendor' | 'manual')} className="w-full">
          <div className="px-4 pt-3">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="manual" className="text-xs">
                <Send className="h-3 w-3 mr-1" />
                Send Message
              </TabsTrigger>
              <TabsTrigger value="vendor" className="text-xs">
                <Reply className="h-3 w-3 mr-1" />
                Add Vendor Reply
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="manual" className="px-4 pb-4 space-y-3">
            <div className="text-xs text-muted-foreground mb-2">
              Subject will be automatically generated with order reference
            </div>
            <div className="space-y-2">
              <Textarea
                value={manualMessage}
                onChange={(e) => setManualMessage(e.target.value)}
                placeholder="Type your message..."
                className="min-h-[100px] text-sm resize-none"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-xs">
                  <Paperclip className="h-3 w-3 mr-1" />
                  Attach
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Sends directly without AI
                </span>
                <Button
                  onClick={sendManualMessage}
                  disabled={!manualMessage.trim() || sendingMessage}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {sendingMessage ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3" />
                  )}
                  Send
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="vendor" className="px-4 pb-4 space-y-3">
            <Textarea
              value={vendorMessage}
              onChange={(e) => setVendorMessage(e.target.value)}
              placeholder="Paste vendor's email response here..."
              className="min-h-[120px] text-sm resize-none"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                AI will analyze and generate a response
              </p>
              <Button
                onClick={generateAIReply}
                disabled={generatingReply || !vendorMessage.trim()}
                size="sm"
                className="flex items-center gap-2"
              >
                {generatingReply ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3" />
                    Generate AI Reply
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIEmailThreadEnhanced;
