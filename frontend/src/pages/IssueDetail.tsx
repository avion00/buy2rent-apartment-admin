import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDataStore } from '@/stores/useDataStore';
import { ArrowLeft, Package, AlertCircle, Bot, MessageSquare, Image as ImageIcon, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { ProductIssueCard } from '@/components/issues/ProductIssueCard';
import { AIConversationPanel } from '@/components/issues/AIConversationPanel';
import { IssuePhotosGallery } from '@/components/issues/IssuePhotosGallery';
import { IssueTimeline } from '@/components/issues/IssueTimeline';
import { IssueResolutionPanel } from '@/components/issues/IssueResolutionPanel';
import { toast } from 'sonner';

export default function IssueDetail() {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const issues = useDataStore((state) => state.issues);
  const getProduct = useDataStore((state) => state.getProduct);
  const getApartment = useDataStore((state) => state.getApartment);
  const getVendorByName = useDataStore((state) => state.getVendorByName);
  const updateIssue = useDataStore((state) => state.updateIssue);
  
  const [issue, setIssue] = useState(issues.find(i => i.id === issueId));
  const product = issue ? getProduct(issue.productId) : undefined;
  const apartment = product ? getApartment(product.apartmentId) : undefined;
  const vendor = issue ? getVendorByName(issue.vendor) : undefined;

  useEffect(() => {
    const foundIssue = issues.find(i => i.id === issueId);
    if (foundIssue) {
      setIssue(foundIssue);
    }
  }, [issueId, issues]);

  if (!issue || !product) {
  return (
    <PageLayout title="Issue Not Found">
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-2xl font-semibold">Issue Not Found</h2>
          <Button onClick={() => navigate('/issues')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Issues
          </Button>
        </div>
      </PageLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'destructive';
      case 'Pending Vendor Response': return 'secondary';
      case 'Resolution Agreed': return 'default';
      case 'Closed': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Closed': return <CheckCircle2 className="h-4 w-4" />;
      case 'Open': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <PageLayout title="Issue Details">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/issues')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Issue Details</h1>
              <p className="text-muted-foreground">Issue #{issue.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(issue.status || 'Open')}
            <Badge variant={getStatusColor(issue.status || 'Open')}>
              {issue.status || 'Open'}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Issue Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      {issue.type}
                    </CardTitle>
                    <CardDescription>
                      Reported on {new Date(issue.reportedOn).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  {issue.aiActivated && (
                    <Badge variant="default" className="gap-1">
                      <Bot className="h-3 w-3" />
                      AI Active
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {issue.description}
                  </p>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Apartment</p>
                    <p className="font-medium">{apartment?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vendor</p>
                    <p className="font-medium">{issue.vendor}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Details */}
            <ProductIssueCard product={product} issue={issue} />

            {/* Tabbed Content */}
            <Tabs defaultValue="conversation" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="conversation" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Conversation
                </TabsTrigger>
                <TabsTrigger value="photos" className="gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Photos ({issue.photos?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="timeline" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Timeline
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="conversation" className="mt-6">
                <AIConversationPanel 
                  issue={issue} 
                  onUpdateIssue={(updates) => {
                    updateIssue(issue.id, updates);
                    toast.success('Issue updated');
                  }}
                />
              </TabsContent>
              
              <TabsContent value="photos" className="mt-6">
                <IssuePhotosGallery 
                  photos={issue.photos || []}
                  onAddPhoto={(photo) => {
                    const updatedPhotos = [...(issue.photos || []), photo];
                    updateIssue(issue.id, { photos: updatedPhotos });
                    toast.success('Photo added');
                  }}
                />
              </TabsContent>
              
              <TabsContent value="timeline" className="mt-6">
                <IssueTimeline issue={issue} product={product} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Actions & Summary */}
          <div className="space-y-6">
            <IssueResolutionPanel 
              issue={issue}
              vendor={vendor}
              onUpdateIssue={(updates) => {
                updateIssue(issue.id, updates);
                toast.success('Issue updated');
              }}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
