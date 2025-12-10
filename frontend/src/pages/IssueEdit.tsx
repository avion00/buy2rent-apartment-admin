import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { 
  AlertCircle, Package, FileText, Truck, Calendar, User, 
  AlertTriangle, CheckCircle2, Loader2, ArrowLeft, Save, Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { issueApi, Issue } from '@/services/issueApi';
import { cn } from '@/lib/utils';

const IssueEdit = () => {
  const navigate = useNavigate();
  const { issueId } = useParams();
  
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    status: 'Open',
    priority: 'Medium',
    impact: '',
    expectedResolution: '',
    replacementEta: '',
    resolutionType: '',
    resolutionNotes: '',
    deliveryDate: '',
    invoiceNumber: '',
    trackingNumber: '',
    aiActivated: false,
    autoNotifyVendor: true,
  });

  const statuses = ['Open', 'Pending Vendor Response', 'Resolution Agreed', 'Closed'];
  const priorities = [
    { value: 'Critical', label: 'Critical', color: 'bg-red-500/10 text-red-600 border-red-200' },
    { value: 'High', label: 'High', color: 'bg-orange-500/10 text-orange-600 border-orange-200' },
    { value: 'Medium', label: 'Medium', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200' },
    { value: 'Low', label: 'Low', color: 'bg-green-500/10 text-green-600 border-green-200' },
  ];
  const impactLevels = ['Blocking Progress', 'Delaying Project', 'Partial Impact', 'Minor Inconvenience', 'No Impact'];
  const resolutionTypes = ['Full Replacement', 'Partial Replacement', 'Repair', 'Refund', 'Credit Note', 'Exchange', 'Other'];

  // Fetch issue data
  useEffect(() => {
    if (!issueId) {
      toast.error('No issue ID provided');
      navigate('/issues');
      return;
    }
    
    setLoading(true);
    issueApi.getIssue(issueId)
      .then((data) => {
        setIssue(data);
        setFormData({
          type: data.type || '',
          description: data.description || '',
          status: data.status || 'Open',
          priority: data.priority || 'Medium',
          impact: data.impact || '',
          expectedResolution: data.expected_resolution || '',
          replacementEta: data.replacement_eta || '',
          resolutionType: data.resolution_type || '',
          resolutionNotes: data.resolution_notes || '',
          deliveryDate: data.delivery_date || '',
          invoiceNumber: data.invoice_number || '',
          trackingNumber: data.tracking_number || '',
          aiActivated: data.ai_activated || false,
          autoNotifyVendor: data.auto_notify_vendor ?? true,
        });
      })
      .catch((err) => {
        console.error('Failed to fetch issue:', err);
        toast.error('Failed to load issue');
        navigate('/issues');
      })
      .finally(() => setLoading(false));
  }, [issueId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue) return;
    
    setSubmitting(true);
    try {
      await issueApi.updateIssue(issue.id, {
        type: formData.type,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        impact: formData.impact || undefined,
        expected_resolution: formData.expectedResolution || undefined,
        replacement_eta: formData.replacementEta || undefined,
        resolution_type: formData.resolutionType || undefined,
        resolution_notes: formData.resolutionNotes || undefined,
        delivery_date: formData.deliveryDate || undefined,
        invoice_number: formData.invoiceNumber || undefined,
        tracking_number: formData.trackingNumber || undefined,
        ai_activated: formData.aiActivated,
        auto_notify_vendor: formData.autoNotifyVendor,
      });
      
      toast.success('Issue updated successfully');
      navigate(`/issues/${issue.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update issue');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!issue) return;
    
    setDeleting(true);
    try {
      await issueApi.deleteIssue(issue.id);
      toast.success('Issue deleted successfully');
      navigate('/issues');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete issue');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <PageLayout title="Edit Issue">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (!issue) {
    return (
      <PageLayout title="Edit Issue">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <p className="text-lg font-medium">Issue not found</p>
          <Button onClick={() => navigate('/issues')} className="mt-4">
            Back to Issues
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Edit Issue">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="/issues">Issues</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink href={`/issues/${issue.id}`}>Issue Details</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Edit</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/issues/${issue.id}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-primary" />
                Edit Issue
              </h1>
              <p className="text-sm text-muted-foreground">Issue #{issue.id.slice(-8)}</p>
            </div>
          </div>
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => setDeleteDialogOpen(true)} 
              disabled={deleting}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete Issue
            </Button>
            <AlertDialogContent className="sm:max-w-md">
              <AlertDialogHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                    <Trash2 className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <AlertDialogTitle className="text-lg">Delete Issue</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm">
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </div>
                </div>
              </AlertDialogHeader>
              <div className="py-4">
                <div className="rounded-lg border bg-muted/50 p-4">
                  <p className="text-sm font-medium text-foreground">
                    {issue.type || 'Issue'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {issue.description?.slice(0, 100)}{issue.description && issue.description.length > 100 ? '...' : ''}
                  </p>
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Issue
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Issue Type & Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Issue Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Issue Type *</Label>
                  <Input 
                    value={formData.type} 
                    onChange={(e) => setFormData(p => ({ ...p, type: e.target.value }))}
                    placeholder="e.g., Broken/Damaged, Wrong Item"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status *</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData(p => ({ ...p, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  rows={4}
                  placeholder="Describe the issue in detail..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Priority & Impact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Priority & Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Priority *</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData(p => ({ ...p, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {priorities.map(pr => (
                      <SelectItem key={pr.value} value={pr.value}>
                        <Badge className={pr.color}>{pr.label}</Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Impact</Label>
                <Select value={formData.impact} onValueChange={(v) => setFormData(p => ({ ...p, impact: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select impact level" /></SelectTrigger>
                  <SelectContent>
                    {impactLevels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Expected Resolution</Label>
                <Input 
                  type="date" 
                  value={formData.expectedResolution} 
                  onChange={(e) => setFormData(p => ({ ...p, expectedResolution: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Replacement ETA</Label>
                <Input 
                  type="date" 
                  value={formData.replacementEta} 
                  onChange={(e) => setFormData(p => ({ ...p, replacementEta: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Delivery Date</Label>
                <Input 
                  type="date" 
                  value={formData.deliveryDate} 
                  onChange={(e) => setFormData(p => ({ ...p, deliveryDate: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Resolution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Resolution
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Resolution Type</Label>
                <Select value={formData.resolutionType} onValueChange={(v) => setFormData(p => ({ ...p, resolutionType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select resolution type" /></SelectTrigger>
                  <SelectContent>
                    {resolutionTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Resolution Notes</Label>
                <Input 
                  value={formData.resolutionNotes} 
                  onChange={(e) => setFormData(p => ({ ...p, resolutionNotes: e.target.value }))}
                  placeholder="Add notes about the resolution..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Tracking Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Invoice Number</Label>
                <Input 
                  value={formData.invoiceNumber} 
                  onChange={(e) => setFormData(p => ({ ...p, invoiceNumber: e.target.value }))}
                  placeholder="Enter invoice number"
                />
              </div>
              <div className="space-y-2">
                <Label>Tracking Number</Label>
                <Input 
                  value={formData.trackingNumber} 
                  onChange={(e) => setFormData(p => ({ ...p, trackingNumber: e.target.value }))}
                  placeholder="Enter tracking number"
                />
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardContent className="py-4 space-y-4">
              <div className="flex items-center gap-4">
                <Checkbox 
                  id="ai" 
                  checked={formData.aiActivated} 
                  onCheckedChange={(c) => setFormData(p => ({ ...p, aiActivated: c as boolean }))} 
                />
                <Label htmlFor="ai">Enable AI-assisted communication</Label>
              </div>
              <div className="flex items-center gap-4">
                <Checkbox 
                  id="notify" 
                  checked={formData.autoNotifyVendor} 
                  onCheckedChange={(c) => setFormData(p => ({ ...p, autoNotifyVendor: c as boolean }))} 
                />
                <Label htmlFor="notify">Auto-notify vendor</Label>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate(`/issues/${issue.id}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default IssueEdit;
