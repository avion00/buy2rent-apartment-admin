import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Mail, Send, Users, Building2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useDataStore } from '@/stores/useDataStore';
import { Separator } from '@/components/ui/separator';

interface BulkEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIssues?: any[];
}

export const BulkEmailModal = ({ open, onOpenChange, selectedIssues = [] }: BulkEmailModalProps) => {
  const { issues, vendors } = useDataStore();
  
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    includeIssueDetails: true,
    includePhotos: true,
  });

  const [sending, setSending] = useState(false);

  // Group issues by vendor
  const issuesByVendor = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    selectedIssues.forEach(issue => {
      if (!grouped[issue.vendor]) {
        grouped[issue.vendor] = [];
      }
      grouped[issue.vendor].push(issue);
    });
    return grouped;
  }, [selectedIssues]);

  const vendorCount = Object.keys(issuesByVendor).length;
  const totalIssues = selectedIssues.length;

  const handleSend = async () => {
    if (!emailData.subject || !emailData.message) {
      toast.error('Please provide email subject and message');
      return;
    }

    setSending(true);

    try {
      // Simulate sending emails
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success('Emails Sent', {
        description: `Successfully sent ${vendorCount} emails to vendors about ${totalIssues} issues.`,
      });

      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to send emails');
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setEmailData({
      subject: '',
      message: '',
      includeIssueDetails: true,
      includePhotos: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Send Bulk Email to Vendors
          </DialogTitle>
          <DialogDescription>
            Send a standardized email to all vendors with open issues. Each vendor will receive information about their specific issues.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-primary" />
                <p className="text-xs font-medium text-muted-foreground">Recipients</p>
              </div>
              <p className="text-2xl font-bold text-primary">{vendorCount}</p>
              <p className="text-xs text-muted-foreground">Vendors</p>
            </div>
            <div className="p-4 bg-danger/5 border border-danger/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-danger" />
                <p className="text-xs font-medium text-muted-foreground">Total Issues</p>
              </div>
              <p className="text-2xl font-bold text-danger">{totalIssues}</p>
              <p className="text-xs text-muted-foreground">Items</p>
            </div>
            <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-warning" />
                <p className="text-xs font-medium text-muted-foreground">Emails</p>
              </div>
              <p className="text-2xl font-bold text-warning">{vendorCount}</p>
              <p className="text-xs text-muted-foreground">To Send</p>
            </div>
          </div>

          {/* Vendor Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Recipients by Vendor</Label>
            <div className="max-h-32 overflow-y-auto border rounded-lg p-3 space-y-2">
              {Object.entries(issuesByVendor).map(([vendor, vendorIssues]) => (
                <div key={vendor} className="flex items-center justify-between py-1">
                  <span className="text-sm font-medium">{vendor}</span>
                  <Badge variant="outline">{vendorIssues.length} issues</Badge>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Email Compose */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject *</Label>
              <input
                id="subject"
                type="text"
                placeholder="e.g., Urgent: Product Issues Requiring Resolution"
                value={emailData.subject}
                onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Email Message *</Label>
              <Textarea
                id="message"
                placeholder="Dear Vendor Team,

We have identified several issues with the products delivered. Please review the details below and provide a resolution plan at your earliest convenience.

Best regards,
Procurement Team"
                value={emailData.message}
                onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                rows={8}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                This message will be sent to all vendors. Issue-specific details will be automatically appended.
              </p>
            </div>

            <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
              <Label className="text-sm font-semibold">Email Options</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeDetails"
                  checked={emailData.includeIssueDetails}
                  onCheckedChange={(checked) => 
                    setEmailData(prev => ({ ...prev, includeIssueDetails: checked as boolean }))
                  }
                />
                <label
                  htmlFor="includeDetails"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Include detailed issue information (product names, SKUs, descriptions)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includePhotos"
                  checked={emailData.includePhotos}
                  onCheckedChange={(checked) => 
                    setEmailData(prev => ({ ...prev, includePhotos: checked as boolean }))
                  }
                />
                <label
                  htmlFor="includePhotos"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Attach issue photos to emails
                </label>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Email Preview</Label>
            <div className="p-4 bg-muted/30 rounded-lg border space-y-2 text-sm">
              <div className="font-semibold">Subject: {emailData.subject || '(No subject)'}</div>
              <Separator />
              <div className="whitespace-pre-wrap">{emailData.message || '(No message)'}</div>
              {emailData.includeIssueDetails && (
                <>
                  <Separator />
                  <div className="text-xs text-muted-foreground italic">
                    [Vendor-specific issue details will be inserted here]
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending || !emailData.subject || !emailData.message}>
            <Send className="h-4 w-4 mr-2" />
            {sending ? 'Sending...' : `Send ${vendorCount} Emails`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
