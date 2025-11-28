import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Plus,
  Search,
  Star,
  Eye,
  Edit,
  Trash2,
  Filter,
  Building2,
  TrendingUp,
  Package,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useVendors, useDeleteVendor } from "@/hooks/useApi";
import { Vendor } from "@/services/api";

const Vendors = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reliabilityFilter, setReliabilityFilter] = useState("all");

  // Debounce search term to improve performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // API hooks
  const { data: vendors = [], isLoading, error } = useVendors();
  const deleteVendorMutation = useDeleteVendor();

  // Log errors only
  useEffect(() => {
    if (error) {
      console.error('Vendors API error:', error);
    }
  }, [error]);

  const filteredVendors = useMemo(() => {
    if (!vendors || vendors.length === 0) return [];
    
    try {
      const filtered = vendors.filter((vendor) => {
        // Ensure vendor has required properties
        if (!vendor || typeof vendor !== 'object') return false;
        if (!vendor.name || typeof vendor.name !== 'string') return false;
        
        try {
          const searchTerm = debouncedSearchTerm.toLowerCase();
          const vendorName = vendor.name.toLowerCase();
          const vendorEmail = vendor.email ? vendor.email.toLowerCase() : '';
          
          const matchesSearch = !debouncedSearchTerm || 
            vendorName.includes(searchTerm) ||
            vendorEmail.includes(searchTerm);

          const activeIssues = typeof vendor.active_issues === 'number' ? vendor.active_issues : 0;
          const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "active" && activeIssues === 0) ||
            (statusFilter === "issues" && activeIssues > 0);

          const reliability = typeof vendor.reliability === 'number' ? vendor.reliability : 0;
          const matchesReliability =
            reliabilityFilter === "all" ||
            (reliabilityFilter === "high" && reliability >= 4.5) ||
            (reliabilityFilter === "medium" && reliability >= 3.5 && reliability < 4.5) ||
            (reliabilityFilter === "low" && reliability < 3.5);

          return matchesSearch && matchesStatus && matchesReliability;
        } catch (filterError) {
          console.error('Error filtering individual vendor:', vendor, filterError);
          return false;
        }
      });
      
      // Limit to 100 vendors for performance
      return filtered.slice(0, 100);
    } catch (error) {
      console.error('Error filtering vendors:', error);
      return [];
    }
  }, [vendors, debouncedSearchTerm, statusFilter, reliabilityFilter]);

  const renderStars = useCallback((rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < Math.floor(rating) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
            }`}
          />
        ))}
        <span className="text-sm font-medium ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  }, []);

  const handleDelete = useCallback((vendor: Vendor) => {
    deleteVendorMutation.mutate(vendor.id);
  }, [deleteVendorMutation]);

  if (isLoading) {
    return (
      <PageLayout title="Vendors">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading vendors...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    console.error('Vendors page error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('Network') || errorMessage.includes('ECONNREFUSED');
    
    return (
      <PageLayout title="Vendors">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {isNetworkError ? 'Backend Connection Error' : 'Failed to load vendors'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {isNetworkError 
                ? 'Cannot connect to the backend server. Please make sure the Django server is running on port 8000.'
                : errorMessage
              }
            </p>
            <div className="space-y-2">
              <Button onClick={() => window.location.reload()}>Retry</Button>
              {isNetworkError && (
                <p className="text-xs text-muted-foreground">
                  Run: <code>python manage.py runserver</code> in the backend directory
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  // Safety check to prevent rendering issues
  if (!Array.isArray(vendors)) {
    console.error('Vendors data is not an array:', vendors);
    return (
      <PageLayout title="Vendors">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Data format error</h3>
            <p className="text-muted-foreground mb-4">
              Invalid vendor data received. Expected array, got: {typeof vendors}
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  // Show empty state if no vendors
  if (vendors.length === 0 && !isLoading && !error) {
    return (
      <PageLayout title="Vendors">
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No vendors yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first vendor to the system.
            </p>
            <Button onClick={() => navigate("/vendors/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Vendor
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Vendors">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Vendors</p>
                  <p className="text-3xl font-bold">{vendors.length}</p>
                </div>
                <Building2 className="h-10 w-10 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Active Vendors</p>
                  <p className="text-3xl font-bold">{vendors.filter((v) => v && typeof v.active_issues === 'number' ? v.active_issues === 0 : true).length}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-3xl font-bold">{vendors.reduce((sum, v) => sum + (v && typeof v.orders_count === 'number' ? v.orders_count : 0), 0)}</p>
                </div>
                <Package className="h-10 w-10 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Avg Reliability</p>
                  <p className="text-3xl font-bold">
                    {vendors.length > 0 ? (vendors.reduce((sum, v) => sum + (v && typeof v.reliability === 'number' ? v.reliability : 0), 0) / vendors.length).toFixed(1) : '0.0'}
                  </p>
                </div>
                <Star className="h-10 w-10 text-yellow-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by vendor name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="issues">With Issues</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={reliabilityFilter} onValueChange={setReliabilityFilter}>
                  <SelectTrigger className="w-[150px]">
                    <Star className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Reliability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="high">High (4.5+)</SelectItem>
                    <SelectItem value="medium">Medium (3.5-4.5)</SelectItem>
                    <SelectItem value="low">Low (&lt;3.5)</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={() => navigate("/vendors/new")} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Vendor
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vendors Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>All Vendors ({filteredVendors.length})</span>
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setReliabilityFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredVendors.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No vendors found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
                <Button onClick={() => navigate("/vendors/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Vendor
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Logo</TableHead>
                      <TableHead>Vendor Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Lead Time</TableHead>
                      <TableHead>Reliability</TableHead>
                      <TableHead className="text-center">Orders</TableHead>
                      <TableHead className="text-center">Issues</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVendors.map((vendor) => {
                      if (!vendor || !vendor.id) return null;
                      return (
                      <TableRow
                        key={vendor.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/vendors/${vendor.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center justify-center text-3xl bg-muted rounded-lg w-12 h-12">
                            {vendor.logo || '🏢'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold">{vendor.name}</p>
                            {vendor.website && typeof vendor.website === 'string' && (
                              <a
                                href={vendor.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {vendor.website.replace(/^https?:\/\//, "") || vendor.website}
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{vendor.email || '-'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {vendor.lead_time && typeof vendor.lead_time === 'string' ? vendor.lead_time : '-'}
                          </Badge>
                        </TableCell>
                        <TableCell>{renderStars(typeof vendor.reliability === 'number' ? vendor.reliability : 0)}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="font-semibold">
                            {typeof vendor.orders_count === 'number' ? vendor.orders_count : 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={(typeof vendor.active_issues === 'number' && vendor.active_issues > 0) ? "destructive" : "default"}
                            className="font-semibold"
                          >
                            {typeof vendor.active_issues === 'number' ? vendor.active_issues : 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/vendors/${vendor.id}`);
                              }}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/vendors/${vendor.id}/edit`);
                              }}
                              title="Edit Vendor"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(vendor);
                              }}
                              title="Delete Vendor"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Vendors;
