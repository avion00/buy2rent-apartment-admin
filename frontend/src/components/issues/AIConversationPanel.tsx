import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Bot, User, Send, AlertCircle, Sparkles, MessageSquare, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { issueApi, AICommunicationLog, Issue } from '@/services/issueApi';

interface AIConversationPanelProps {
  issue: Issue;
  onUpdateIssue: (updates: Partial<Issue>) => void;
}

export function AIConversationPanel({ issue, onUpdateIssue }: AIConversationPanelProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [conversation, setConversation] = useState<AICommunicationLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch conversation on mount and when issue changes
  useEffect(() => {
    const fetchConversation = async () => {
      try {
        setLoading(true);
        const data = await issueApi.getConversation(issue.id);
        setConversation(data.conversation || []);
      } catch (error) {
        console.error('Failed to fetch conversation:', error);
        toast.error('Failed to load conversation');
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [issue.id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsAIProcessing(true);

    try {
      // Send message to vendor via email
      await issueApi.sendManualMessage(issue.id, {
        subject: `Re: Issue #${issue.id}`,
        message: newMessage,
        to_email: issue.vendor_details?.email || ''
      });

      // Refresh conversation to show the sent message
      const data = await issueApi.getConversation(issue.id);
      setConversation(data.conversation || []);
      
      setNewMessage('');
      toast.success('Message sent to vendor successfully');
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast.error(error.response?.data?.message || 'Failed to send message to vendor');
    } finally {
      setIsAIProcessing(false);
    }
  };

  const getConversationSummary = () => {
    const logs = conversation || [];
    const aiMessages = logs.filter(log => log.sender === 'AI').length;
    const vendorMessages = logs.filter(log => log.sender === 'Vendor').length;
    const systemMessages = logs.filter(log => log.sender === 'System' || log.sender === 'Admin').length;

    return { total: logs.length, aiMessages, vendorMessages, systemMessages };
  };

  const summary = getConversationSummary();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{summary.total}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Total Messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Bot className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{summary.aiMessages}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">AI Messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{summary.vendorMessages}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Vendor Replies</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <AlertCircle className="h-4 w-4 text-warning" />
              <span className="text-2xl font-bold">{summary.systemMessages}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">System Notes</p>
          </CardContent>
        </Card>
      </div>

      {/* Conversation Log */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Communication Log
              </CardTitle>
              <CardDescription>
                {issue.ai_activated 
                  ? 'AI is actively managing this conversation with the vendor'
                  : 'Manual conversation tracking'}
              </CardDescription>
            </div>
            {issue.ai_activated && (
              <Badge variant="default" className="gap-1">
                <Sparkles className="h-3 w-3" />
                AI Active
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {conversation && conversation.length > 0 ? (
                  conversation.map((log, index) => {
                  const isHumanAction = log.message.toLowerCase().includes('please arrange') || 
                                      log.message.toLowerCase().includes('action required') ||
                                      log.message.toLowerCase().includes('human action');
                  
                  return (
                    <div 
                      key={index} 
                      className={cn(
                        "flex gap-3 p-4 rounded-lg border transition-all",
                        log.sender === 'AI' && 'bg-primary/5 border-primary/20',
                        log.sender === 'Vendor' && 'bg-muted border-border',
                        log.sender === 'System' && 'bg-accent/50 border-accent',
                        isHumanAction && 'border-2 border-warning shadow-md'
                      )}
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          log.sender === 'AI' && 'bg-primary text-primary-foreground',
                          log.sender === 'Vendor' && 'bg-muted-foreground text-background',
                          log.sender === 'System' && 'bg-warning text-warning-foreground'
                        )}>
                          {log.sender === 'AI' ? (
                            <Bot className="h-4 w-4" />
                          ) : log.sender === 'Vendor' ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge 
                            variant={log.sender === 'AI' ? 'default' : 'outline'} 
                            className={cn(
                              "text-xs",
                              isHumanAction && 'bg-warning text-warning-foreground'
                            )}
                          >
                            {log.sender}
                          </Badge>
                          {isHumanAction && (
                            <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/50">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Action Required
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className={cn(
                          "text-sm whitespace-pre-wrap leading-relaxed",
                          isHumanAction && "font-medium"
                        )}>
                          {log.message}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No messages yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start by adding a message below
                  </p>
                </div>
              )}

              {isAIProcessing && (
                <div className="flex gap-3 p-4 rounded-lg border bg-primary/5 border-primary/20">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4 animate-pulse" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <Badge variant="default" className="text-xs mb-2">AI</Badge>
                    <p className="text-sm text-muted-foreground">AI is processing...</p>
                  </div>
                </div>
                )}
              </div>
            </ScrollArea>
          )}

          {/* Message Input */}
          <div className="flex gap-2 mt-4">
            <Input
              placeholder="Add a message to the log..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button onClick={handleSendMessage} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
