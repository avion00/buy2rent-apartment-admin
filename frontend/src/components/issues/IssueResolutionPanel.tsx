import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Vendor } from '@/stores/useDataStore';
import { issueApi, Issue } from '@/services/issueApi';
import { Bot, Mail, Phone, Globe, CheckCircle2, Play, Pause, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface IssueResolutionPanelProps {
  issue: Issue;
  vendor?: Vendor;
  onUpdateIssue: (updates: Partial<Issue>) => void;
}

export function IssueResolutionPanel({ issue, vendor, onUpdateIssue }: IssueResolutionPanelProps) {
  const [localAIActivated, setLocalAIActivated] = useState(issue.ai_activated || false);
  const [localStatus, setLocalStatus] = useState(issue.status || 'Open');

  // Sync local state with issue prop
  useEffect(() => {
    setLocalAIActivated(issue.ai_activated || false);
    setLocalStatus(issue.status || 'Open');
  }, [issue.ai_activated, issue.status]);

  const handleToggleAI = async () => {
    const newState = !localAIActivated;
    setLocalAIActivated(newState);
    
    try {
      if (newState) {
        // Activate AI and send initial email to vendor
        const response = await issueApi.activateAIEmail(issue.id);
        if (response.data?.success) {
          onUpdateIssue({ ai_activated: true });
          toast.success('AI Chatbot activated and email sent to vendor');
        } else {
          throw new Error(response.data?.message || 'Failed to activate AI');
        }
      } else {
        // Just pause AI (update field only)
        await issueApi.updateIssue(issue.id, { ai_activated: false });
        onUpdateIssue({ ai_activated: false });
        toast.info('AI Chatbot paused');
      }
    } catch (error: any) {
      console.error('Failed to toggle AI:', error);
      toast.error(error.message || 'Failed to update AI status');
      // Revert local state on error
      setLocalAIActivated(!newState);
    }
  };

  const handleStatusChange = async (newStatus: Issue['status']) => {
    setLocalStatus(newStatus);
    
    try {
      await issueApi.updateIssue(issue.id, { status: newStatus });
      onUpdateIssue({ status: newStatus });
      toast.success('Status updated');
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
      // Revert local state on error
      setLocalStatus(issue.status || 'Open');
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Resolution
          </CardTitle>
          <CardDescription>
            Automate vendor communication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
            <div className="space-y-1">
              <Label htmlFor="ai-toggle" className="text-base font-semibold cursor-pointer">
                AI Chatbot
              </Label>
              <p className="text-sm text-muted-foreground">
                {localAIActivated ? 'Active' : 'Inactive'}
              </p>
            </div>
            <Switch
              id="ai-toggle"
              checked={localAIActivated}
              onCheckedChange={handleToggleAI}
            />
          </div>

          {localAIActivated && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <Play className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">AI is monitoring this issue</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => toast.info('AI settings opened')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configure AI Behavior
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Resolution Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Status</Label>
            <Select value={localStatus} onValueChange={handleStatusChange}>
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

          {localStatus === 'Closed' && (
            <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
              <p className="text-sm text-success flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Issue has been resolved
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vendor Contact */}
      {vendor && (
        <Card>
          <CardHeader>
            <CardTitle>Vendor Contact</CardTitle>
            <CardDescription>{vendor.companyName || vendor.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {vendor.email && (
              <a 
                href={`mailto:${vendor.email}`}
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4" />
                {vendor.email}
              </a>
            )}
            
            {vendor.phone && (
              <a 
                href={`tel:${vendor.phone}`}
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4" />
                {vendor.phone}
              </a>
            )}
            
            {vendor.website && (
              <a 
                href={vendor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
              >
                <Globe className="h-4 w-4" />
                Visit Website
              </a>
            )}

            <Separator />

            <Button variant="outline" size="sm" className="w-full">
              <Mail className="h-4 w-4 mr-2" />
              Send Manual Email
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => toast.info('Replacement request sent')}
          >
            Request Replacement
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => toast.info('Refund request sent')}
          >
            Request Refund
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => toast.info('Escalation triggered')}
          >
            Escalate to Manager
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
