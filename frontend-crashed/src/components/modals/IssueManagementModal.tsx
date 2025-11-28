import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EnhancedTextarea } from '@/components/ui/enhanced-textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useDataStore, Product, Issue } from '@/stores/useDataStore';
import { toast } from 'sonner';
import { Bot, User, AlertCircle, CheckCircle, Clock, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IssueManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  onIssueUpdated?: () => void;
}

export const IssueManagementModal = ({ open, onOpenChange, product, onIssueUpdated }: IssueManagementModalProps) => {
  const getIssuesByApartment = useDataStore((state) => state.getIssuesByApartment);
  const addIssue = useDataStore((state) => state.addIssue);
  const updateIssue = useDataStore((state) => state.updateIssue);
  const updateProduct = useDataStore((state) => state.updateProduct);
  const addActivity = useDataStore((state) => state.addActivity);
  const addAINote = useDataStore((state) => state.addAINote);
  
  const issues = getIssuesByApartment(product.apartmentId);
  const currentIssue = issues.find(i => i.id === product.issueId || i.productId === product.id);
  
  const [description, setDescription] = useState('');
  const [issueType, setIssueType] = useState<Issue['type']>('Broken/Damaged');
  const [aiActivated, setAiActivated] = useState(false);
  const [resolutionStatus, setResolutionStatus] = useState<Issue['resolutionStatus']>('Open');

  useEffect(() => {
    if (currentIssue) {
      setDescription(currentIssue.description);
      setIssueType(currentIssue.type);
      setAiActivated(currentIssue.aiActivated || false);
      setResolutionStatus(currentIssue.resolutionStatus || 'Open');
    } else {
      setDescription('');
      setIssueType('Broken/Damaged');
      setAiActivated(false);
      setResolutionStatus('Open');
    }
  }, [currentIssue, open]);

  const handleSaveIssue = () => {
    if (!description.trim()) {
      toast.error('Please provide a description of the issue');
      return;
    }

    if (currentIssue) {
      // Update existing issue
      updateIssue(currentIssue.id, {
        description,
        type: issueType,
        aiActivated,
        resolutionStatus,
      });
      
      // Update product issue state
      const newIssueState = aiActivated ? 'AI Resolving' : 
                           resolutionStatus === 'Closed' ? 'Resolved' : 'Issue Reported';
      updateProduct(product.id, { issueState: newIssueState });
      
      toast.success('Issue updated');
    } else {
      // Create new issue
      const newIssue: Omit<Issue, 'id'> = {
        apartmentId: product.apartmentId,
        productId: product.id,
        productName: product.product,
        vendor: product.vendor,
        type: issueType,
        description,
        reportedOn: new Date().toISOString(),
        status: 'Open',
        aiActivated,
        aiCommunicationLog: [],
        resolutionStatus: 'Open',
      };
      
      addIssue(newIssue);
      
      // Update product
      const issueState = aiActivated ? 'AI Resolving' : 'Issue Reported';
      updateProduct(product.id, { issueState });
      
      // Add activity
      addActivity({
        apartmentId: product.apartmentId,
        actor: 'Admin',
        icon: 'AlertCircle',
        summary: `Issue reported for "${product.product}": ${issueType}`,
        type: 'issue',
      });
      
      // If AI is activated, simulate AI action
      if (aiActivated) {
        setTimeout(() => {
          addAINote({
            apartmentId: product.apartmentId,
            sender: 'AI',
            content: `Automatically analyzing issue with ${product.product}. Preparing vendor communication for ${product.vendor}...`,
          });
        }, 500);
      }
      
      toast.success('Issue created' + (aiActivated ? ' - AI activated' : ''));
    }
    
    onIssueUpdated?.();
    onOpenChange(false);
  };

  const handleToggleAI = () => {
    const newState = !aiActivated;
    setAiActivated(newState);
    
    if (currentIssue && newState) {
      // Simulate AI activation
      toast.info('AI Chatbot activated for this issue');
    }
  };

  const getStatusIcon = (status?: Issue['resolutionStatus']) => {
    switch (status) {
      case 'Closed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'Resolution Agreed':
        return <CheckCircle className="h-4 w-4 text-primary" />;
      case 'Pending Vendor Response':
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <AlertCircle className="h-4 w-4 text-danger" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Issue Management - {product.product}</DialogTitle>
          <DialogDescription>
            Report and track issues, activate AI assistance for automated vendor communication
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Issue Details Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="issueType">Issue Type</Label>
              <Select value={issueType} onValueChange={(value: any) => setIssueType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Broken/Damaged">Broken/Damaged</SelectItem>
                  <SelectItem value="Wrong Item/Color">Wrong Item/Color</SelectItem>
                  <SelectItem value="Missing Parts">Missing Parts</SelectItem>
                  <SelectItem value="Incorrect Quantity">Incorrect Quantity</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description</Label>
              <EnhancedTextarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="resolutionStatus">Resolution Status</Label>
              <Select value={resolutionStatus} onValueChange={(value: any) => setResolutionStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Pending Vendor Response">Pending Vendor Response</SelectItem>
                  <SelectItem value="Resolution Agreed">Resolution Agreed</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />
          
          {/* AI Activation Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <Label htmlFor="aiActivated" className="text-base font-semibold cursor-pointer">
                    Activate AI Chatbot for Resolution
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  AI will automatically communicate with vendor to resolve this issue
                </p>
              </div>
              <Switch
                id="aiActivated"
                checked={aiActivated}
                onCheckedChange={handleToggleAI}
              />
            </div>
            
            {aiActivated && (
              <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <Play className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">AI Chatbot is active</span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="ml-auto"
                  onClick={() => toast.info('AI chatbot paused for this issue')}
                >
                  <Pause className="h-3 w-3 mr-1" />
                  Pause AI
                </Button>
              </div>
            )}
          </div>

          {/* AI Communication Log Section */}
          {currentIssue && currentIssue.aiCommunicationLog && currentIssue.aiCommunicationLog.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-semibold">AI Communication Log</Label>
                  <Badge variant="outline">{currentIssue.aiCommunicationLog.length} messages</Badge>
                </div>
                
                <ScrollArea className="h-64 border rounded-lg p-4">
                  <div className="space-y-4">
                    {currentIssue.aiCommunicationLog.map((log, index) => {
                      const isHumanAction = log.message.toLowerCase().includes('please arrange') || 
                                          log.message.toLowerCase().includes('action required') ||
                                          log.message.toLowerCase().includes('human action');
                      
                      return (
                        <div 
                          key={index} 
                          className={cn(
                            "flex gap-3 p-3 rounded-lg",
                            log.sender === 'AI' ? 'bg-primary/5' : 'bg-muted',
                            isHumanAction && 'border-2 border-warning shadow-sm'
                          )}
                        >
                          <div className="flex-shrink-0 mt-1">
                            {log.sender === 'AI' ? (
                              <Bot className="h-4 w-4 text-primary" />
                            ) : log.sender === 'Vendor' ? (
                              <User className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-warning" />
                            )}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
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
                              "text-sm whitespace-pre-wrap",
                              isHumanAction && "font-medium"
                            )}>
                              {log.message}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
                
                {currentIssue.aiCommunicationLog.some(log => 
                  log.message.toLowerCase().includes('please arrange') || 
                  log.message.toLowerCase().includes('action required')
                ) && (
                  <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/30 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-warning" />
                    <span className="text-sm font-medium text-warning-foreground">
                      Human action required - please review the communication log above
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
          
          {/* Issue Status Summary */}
          {currentIssue && (
            <>
              <Separator />
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(currentIssue.resolutionStatus)}
                  <span className="font-medium">Current Status:</span>
                  <Badge>{currentIssue.resolutionStatus || 'Open'}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Reported: {new Date(currentIssue.reportedOn).toLocaleDateString()}
                </div>
              </div>
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveIssue}>
            {currentIssue ? 'Update' : 'Create'} Issue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
