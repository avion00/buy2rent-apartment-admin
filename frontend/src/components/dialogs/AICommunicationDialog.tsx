import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, User, Send, AlertCircle, Sparkles, MessageSquare, Loader2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { issueApi, AICommunicationLog, Issue } from '@/services/issueApi';

interface AICommunicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issueId: string | null;
  productName?: string;
  onIssueCreated?: (issueId: string) => void;
}

export function AICommunicationDialog({
  open,
  onOpenChange,
  issueId,
  productName,
  onIssueCreated,
}: AICommunicationDialogProps) {
  const [issue, setIssue] = useState<Issue | null>(null);
  const [conversation, setConversation] = useState<AICommunicationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [localAIActivated, setLocalAIActivated] = useState(false);

  const splitEmailReply = (message: string) => {
    const text = (message || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    if (!text.trim()) {
      return { main: '', quoted: '' };
    }

    const markers: Array<{ idx: number }> = [];

    const gmailMarker = text.search(/\nOn\s.+\swrote:\s*\n/i);
    if (gmailMarker !== -1) markers.push({ idx: gmailMarker });

    const outlookMarker = text.search(/\nFrom:\s.+\nSent:\s.+\nTo:\s.+\nSubject:\s.+\n/i);
    if (outlookMarker !== -1) markers.push({ idx: outlookMarker });

    const quotedLineMarker = text.search(/\n>\s?/);
    if (quotedLineMarker !== -1) markers.push({ idx: quotedLineMarker });

    if (markers.length === 0) {
      return { main: text.trim(), quoted: '' };
    }

    const splitAt = Math.min(...markers.map(m => m.idx));
    const main = text.slice(0, splitAt).trim();
    const quoted = text.slice(splitAt).trim();
    return { main, quoted };
  };

  useEffect(() => {
    if (!open || !issueId) {
      setIssue(null);
      setConversation([]);
      return;
    }

    let cancelled = false;
    let intervalId: number | undefined;

    const fetchData = async (showLoading: boolean) => {
      try {
        if (showLoading) setLoading(true);
        
        const [issueData, conversationData] = await Promise.all([
          issueApi.getIssue(issueId),
          issueApi.getConversation(issueId),
        ]);

        if (!cancelled) {
          setIssue(issueData);
          setConversation(conversationData.conversation || []);
          setLocalAIActivated(issueData.ai_activated || false);
        }
      } catch (error) {
        if (showLoading) {
          console.error('Failed to fetch data:', error);
          toast.error('Failed to load communication log');
        }
      } finally {
        if (showLoading && !cancelled) setLoading(false);
      }
    };

    fetchData(true);

    intervalId = window.setInterval(() => {
      fetchData(false);
    }, 8000);

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [open, issueId]);

  const handleToggleAI = async () => {
    if (!issue) return;

    const newState = !localAIActivated;
    setLocalAIActivated(newState);

    try {
      if (newState) {
        const response = await issueApi.activateAIEmail(issue.id);
        if (response.data?.success) {
          toast.success('AI Chatbot activated and email sent to vendor');
          const updatedIssue = await issueApi.getIssue(issue.id);
          setIssue(updatedIssue);
          const conversationData = await issueApi.getConversation(issue.id);
          setConversation(conversationData.conversation || []);
        } else {
          throw new Error(response.data?.message || 'Failed to activate AI');
        }
      } else {
        await issueApi.updateIssue(issue.id, { ai_activated: false });
        toast.info('AI Chatbot paused');
        const updatedIssue = await issueApi.getIssue(issue.id);
        setIssue(updatedIssue);
      }
    } catch (error: any) {
      console.error('Failed to toggle AI:', error);
      toast.error(error.message || 'Failed to update AI status');
      setLocalAIActivated(!newState);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !issue) return;

    setIsAIProcessing(true);

    try {
      await issueApi.sendManualMessage(issue.id, {
        message: newMessage,
        to_email: issue.vendor_details?.email || '',
      });

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

  if (!issueId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>No Issue Found</DialogTitle>
            <DialogDescription>
              This product doesn't have an associated issue yet. Please create an issue first to use AI communication.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] overflow-hidden flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-primary/5 to-transparent shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold">AI Resolution</div>
                <div className="text-xs font-normal text-muted-foreground">{productName || 'Product'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">AI Chatbot</span>
                <Switch
                  checked={localAIActivated}
                  onCheckedChange={handleToggleAI}
                  disabled={!issue}
                />
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            {/* Skeleton Status Bar */}
            <div className="px-6 py-3 bg-muted/30 border-b shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3.5 w-3.5 rounded-full" />
                    <Skeleton className="h-4 w-6" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3.5 w-3.5 rounded-full" />
                    <Skeleton className="h-4 w-6" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3.5 w-3.5 rounded-full" />
                    <Skeleton className="h-4 w-6" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3.5 w-3.5 rounded-full" />
                    <Skeleton className="h-4 w-6" />
                    <Skeleton className="h-3 w-14" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>

            {/* Skeleton Communication Log */}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col px-6 py-4">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-3 w-48" />
              </div>

              {/* Skeleton Messages */}
              <div className="space-y-2.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-2.5 p-3 rounded-lg border bg-muted/50">
                    <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-12 rounded" />
                        <Skeleton className="h-5 w-16 rounded" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-5/6" />
                      <Skeleton className="h-3 w-4/6" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Skeleton Input */}
              <div className="flex gap-2 mt-3 pt-3 border-t shrink-0">
                <Skeleton className="h-9 flex-1 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            {/* Compact Status Bar */}
            <div className="px-6 py-3 bg-muted/30 border-b shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">{summary.total}</span>
                    <span className="text-xs text-muted-foreground">Total</span>
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex items-center gap-2">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                    <span className="text-sm font-medium">{summary.aiMessages}</span>
                    <span className="text-xs text-muted-foreground">AI</span>
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">{summary.vendorMessages}</span>
                    <span className="text-xs text-muted-foreground">Vendor</span>
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5 text-orange-500" />
                    <span className="text-sm font-medium">{summary.systemMessages}</span>
                    <span className="text-xs text-muted-foreground">System</span>
                  </div>
                </div>
                {localAIActivated && (
                  <Badge variant="default" className="gap-1.5 px-2.5 py-1">
                    <Sparkles className="h-3 w-3 animate-pulse" />
                    <span className="text-xs">AI Active</span>
                  </Badge>
                )}
              </div>
            </div>

            {/* Communication Log */}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col px-6 py-4">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Communication Log
                </h3>
                {localAIActivated && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-primary" />
                    AI is actively managing this conversation
                  </p>
                )}
              </div>

              <ScrollArea className="flex-1 pr-3">
                <div className="space-y-2.5">
                  {conversation && conversation.length > 0 ? (
                    conversation.map((log, index) => {
                      const isHumanAction =
                        log.message.toLowerCase().includes('please arrange') ||
                        log.message.toLowerCase().includes('action required') ||
                        log.message.toLowerCase().includes('human action');

                      return (
                        <div
                          key={index}
                          className={cn(
                            'flex gap-2.5 p-3 rounded-lg border transition-all hover:shadow-sm',
                            log.sender === 'AI' && 'bg-primary/5 border-primary/20',
                            log.sender === 'Vendor' && 'bg-muted/50 border-border',
                            log.sender === 'System' && 'bg-orange-50 border-orange-200',
                            isHumanAction && 'border-2 border-orange-400 shadow-sm'
                          )}
                        >
                          <div className="flex-shrink-0">
                            <div
                              className={cn(
                                'w-7 h-7 rounded-full flex items-center justify-center',
                                log.sender === 'AI' && 'bg-primary text-primary-foreground',
                                log.sender === 'Vendor' && 'bg-slate-600 text-white',
                                log.sender === 'System' && 'bg-orange-500 text-white'
                              )}
                            >
                              {log.sender === 'AI' ? (
                                <Bot className="h-3.5 w-3.5" />
                              ) : log.sender === 'Vendor' ? (
                                <User className="h-3.5 w-3.5" />
                              ) : (
                                <AlertCircle className="h-3.5 w-3.5" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 space-y-1.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                variant={log.sender === 'AI' ? 'default' : 'outline'}
                                className={cn('text-[10px] px-1.5 py-0 h-5', isHumanAction && 'bg-orange-500 text-white border-orange-500')}
                              >
                                {log.sender}
                              </Badge>
                              {isHumanAction && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-orange-50 text-orange-600 border-orange-300">
                                  <AlertCircle className="h-2.5 w-2.5 mr-1" />
                                  Action Required
                                </Badge>
                              )}
                              {log.message_type === 'email' && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                                  Email
                                </Badge>
                              )}
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(log.timestamp).toLocaleString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                            {log.subject && (
                              <p className="text-xs font-semibold text-foreground line-clamp-1">{log.subject}</p>
                            )}
                            {(() => {
                              const isEmailLike = log.message_type === 'email' || !!log.subject;
                              const { main, quoted } = isEmailLike
                                ? splitEmailReply(log.message)
                                : { main: log.message, quoted: '' };

                              return (
                                <div className="space-y-1.5">
                                  <p
                                    className={cn(
                                      'text-xs whitespace-pre-wrap leading-relaxed text-foreground/90',
                                      isHumanAction && 'font-medium'
                                    )}
                                  >
                                    {main}
                                  </p>

                                  {quoted && (
                                    <Accordion type="single" collapsible>
                                      <AccordionItem value="quoted" className="border-0">
                                        <AccordionTrigger className="py-1.5 text-[10px] text-muted-foreground hover:no-underline">
                                          Show previous email
                                        </AccordionTrigger>
                                        <AccordionContent>
                                          <div className="text-[10px] text-muted-foreground whitespace-pre-wrap leading-relaxed bg-muted/30 p-2 rounded">
                                            {quoted}
                                          </div>
                                        </AccordionContent>
                                      </AccordionItem>
                                    </Accordion>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="p-3 rounded-full bg-muted mb-3">
                        <MessageSquare className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">No messages yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Start the conversation below</p>
                    </div>
                  )}

                  {isAIProcessing && (
                    <div className="flex gap-2.5 p-3 rounded-lg border bg-primary/5 border-primary/20 animate-pulse">
                      <div className="flex-shrink-0">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-primary text-primary-foreground">
                          <Bot className="h-3.5 w-3.5" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <Badge variant="default" className="text-[10px] px-1.5 py-0 h-5 mb-1.5">
                          AI
                        </Badge>
                        <p className="text-xs text-muted-foreground">Processing your message...</p>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="flex gap-2 mt-3 pt-3 border-t shrink-0">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  disabled={!issue}
                  className="text-sm"
                />
                <Button 
                  onClick={handleSendMessage} 
                  size="icon" 
                  disabled={!issue || !newMessage.trim()}
                  className="shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
