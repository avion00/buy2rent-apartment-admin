import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft, 
  Edit, 
  Mail, 
  Globe, 
  Star,
  Package,
  Building2,
  TrendingUp,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useVendor } from '@/hooks/useApi';

const VendorView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Load vendor from API
  const { data: vendor, isLoading, error } = useVendor(id || "");

  if (!id) {
    return (
      <PageLayout title="Vendor Not Found">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No vendor ID provided</h3>
            <Button onClick={() => navigate('/vendors')}>Back to Vendors</Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  if (isLoading) {
    return (
      <PageLayout title="Loading vendor...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading vendor details...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !vendor) {
    return (
      <PageLayout title="Vendor Not Found">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Vendor Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The vendor you're looking for doesn't exist or failed to load.
            </p>
            <Button onClick={() => navigate('/vendors')}>Back to Vendors</Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  const renderStars = (rating: number) => {
    const safeRating = typeof rating === 'number' && !isNaN(rating) ? rating : 0;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(safeRating)
                ? 'fill-yellow-500 text-yellow-500'
                : 'text-muted-foreground'
            }`}
          />
        ))}
        <span className="text-sm font-medium ml-1">{safeRating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <PageLayout title={vendor.name || 'Vendor Details'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/vendors')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Vendors
          </Button>
          
          <Button 
            onClick={() => navigate(`/vendors/${vendor.id}/edit`)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Vendor
          </Button>
        </div>

        {/* Vendor Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-4xl">
                  {vendor.logo || '🏢'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h2 className="text-3xl font-bold">{vendor.name}</h2>
                      <p className="text-muted-foreground">Verified Vendor</p>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      Active
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    {renderStars(vendor.reliability || 0)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {vendor.email ? (
                      <a href={`mailto:${vendor.email}`} className="hover:underline">
                        {vendor.email}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">No email</span>
                    )}
                  </div>
                  {vendor.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={vendor.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {vendor.website.replace(/^https?:\/\//, '') || vendor.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Lead Time: {vendor.lead_time || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>{vendor.orders_count || 0} Total Orders</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-3xl font-bold mt-1">{vendor.orders_count || 0}</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Issues</p>
                  <p className="text-3xl font-bold mt-1">{vendor.active_issues || 0}</p>
                </div>
                <AlertCircle className={`h-8 w-8 ${(vendor.active_issues || 0) > 0 ? 'text-destructive' : 'text-green-500'}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Products</p>
                  <p className="text-3xl font-bold mt-1">3</p>
                </div>
                <Building2 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reliability</p>
                  <p className="text-3xl font-bold mt-1">{(vendor.reliability || 0).toFixed(1)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Simple Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Contact Information</h3>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{vendor.email || 'No email'}</span>
                  </div>
                  {vendor.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                        {vendor.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Business Details</h3>
                <Separator />
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Lead Time</span>
                    <span className="text-sm font-medium">{vendor.lead_time || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Reliability Score</span>
                    <span className="text-sm font-medium">{(vendor.reliability || 0)}/5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Orders</span>
                    <span className="text-sm font-medium">{vendor.orders_count || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default VendorView;
