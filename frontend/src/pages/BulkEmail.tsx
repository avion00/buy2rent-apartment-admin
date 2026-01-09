import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Send, Users, Package, ArrowLeft, ChevronDown, ChevronRight, AlertCircle, Calendar, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useDataStore } from '@/stores/useDataStore';
import { Separator } from '@/components/ui/separator';
import { issueApi } from '@/services/issueApi';
import { cn } from '@/lib/utils';

const BulkEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { issues, vendors } = useDataStore();
  
  const selectedIssues = location.state?.selectedIssues || [];
  
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    includeIssueDetails: true,
    includePhotos: true,
  });

  const [sending, setSending] = useState(false);
  const [expandedVendors, setExpandedVendors] = useState<Set<string>>(new Set());

  // Group issues by vendor with vendor details
  const issuesByVendor = useMemo(() => {
    const grouped: Record<string, { vendor: any; issues: any[] }> = {};
    
    selectedIssues.forEach((issue: any) => {
      const vendorId = issue.vendor;
      const vendorDetails = issue.vendor_details || vendors.find((v: any) => v.id === vendorId);
      
      if (!grouped[vendorId]) {
        grouped[vendorId] = {
          vendor: vendorDetails || { id: vendorId, name: 'Unknown Vendor' },
          issues: []
        };
      }
      grouped[vendorId].issues.push(issue);
    });
    
    return grouped;
  }, [selectedIssues, vendors]);

  const vendorCount = Object.keys(issuesByVendor).length;
  const totalIssues = selectedIssues.length;

  const toggleVendor = (vendorId: string) => {
    setExpandedVendors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(vendorId)) {
        newSet.delete(vendorId);
      } else {
        newSet.add(vendorId);
      }
      return newSet;
    });
  };

  const handleSend = async () => {
    if (!emailData.subject || !emailData.message) {
      toast.error('Please provide email subject and message');
      return;
    }

    setSending(true);

    try {
      // Extract issue IDs from selected issues
      const issueIds = selectedIssues.map((issue: any) => issue.id);

      // Call the bulk email API
      const response = await issueApi.sendBulkEmail({
        issue_ids: issueIds,
        subject: emailData.subject,
        message: emailData.message,
        include_issue_details: emailData.includeIssueDetails,
        include_photos: emailData.includePhotos,
      });

      if (response.success) {
        toast.success('Emails Sent Successfully', {
          description: `Sent ${response.results.sent} emails to vendors about ${response.results.total_issues} issues.`,
        });
        navigate('/issues');
      } else {
        toast.error('Failed to send some emails', {
          description: response.message || 'Please check the details and try again.',
        });
      }
    } catch (error: any) {
      console.error('Bulk email error:', error);
      toast.error('Failed to send emails', {
        description: error.response?.data?.message || error.message || 'An error occurred while sending emails.',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <PageLayout
      title="Send Bulk Email to Vendors"
      subtitle="Send a standardized email to all vendors with open issues. Each vendor will receive information about their specific issues."
      actions={
        <Button
          variant="outline"
          onClick={() => navigate('/issues')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Issues
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Email Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recipients</p>
                  <p className="text-2xl font-bold text-primary">{vendorCount}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Vendors</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-danger/10 rounded-lg">
                  <Package className="h-5 w-5 text-danger" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Issues</p>
                  <p className="text-2xl font-bold text-danger">{totalIssues}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Items</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Mail className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Emails</p>
                  <p className="text-2xl font-bold text-warning">{vendorCount}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">To Send</p>
            </CardContent>
          </Card>
        </div>

        {/* Vendor Preview with Collapsible Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recipients by Vendor
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Click on a vendor to view their issues
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(issuesByVendor).map(([vendorId, { vendor, issues }]) => (
                <div key={vendorId} className="border rounded-lg overflow-hidden">
                  {/* Vendor Header */}
                  <button
                    onClick={() => toggleVendor(vendorId)}
                    className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {expandedVendors.has(vendorId) ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div className="text-left">
                        <p className="font-semibold text-base">{vendor.name}</p>
                        {vendor.email && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Mail className="h-3 w-3" />
                            {vendor.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {issues.length} {issues.length === 1 ? 'issue' : 'issues'}
                    </Badge>
                  </button>

                  {/* Collapsible Issue List */}
                  {expandedVendors.has(vendorId) && (
                    <div className="p-4 bg-background border-t space-y-2">
                      {issues.map((issue: any, idx: number) => (
                        <div
                          key={issue.id}
                          className="p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  #{idx + 1}
                                </Badge>
                                <span className="text-sm font-medium">
                                  {issue.display_product_name || issue.product_name || 'Product Issue'}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <AlertCircle className="h-3 w-3" />
                                <span className="font-medium">{issue.type}</span>
                                <span>•</span>
                                <Badge 
                                  variant={
                                    issue.priority === 'Critical' ? 'destructive' :
                                    issue.priority === 'High' ? 'default' :
                                    'secondary'
                                  }
                                  className="text-xs"
                                >
                                  {issue.priority}
                                </Badge>
                              </div>

                              {issue.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2 flex items-start gap-1">
                                  <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                  {issue.description}
                                </p>
                              )}

                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>Reported: {new Date(issue.reported_on).toLocaleDateString()}</span>
                                <span>•</span>
                                <Badge variant="outline" className="text-xs">
                                  {issue.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Email Compose */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Compose Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                rows={10}
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
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Email Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted/30 rounded-lg border space-y-3 text-sm">
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
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 pb-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/issues')}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={sending || !emailData.subject || !emailData.message}
            size="lg"
          >
            <Send className="h-4 w-4 mr-2" />
            {sending ? 'Sending...' : `Send ${vendorCount} Emails`}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default BulkEmail;
