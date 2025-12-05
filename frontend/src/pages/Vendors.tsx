import { useState, useMemo } from "react";
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
import { toast } from "sonner";
import { useVendors, useDeleteVendor } from "@/hooks/useVendorApi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Vendors = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reliabilityFilter, setReliabilityFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<{ id: string; name: string } | null>(null);

  // Fetch vendors from API
  const { data: vendorsData, isLoading, error } = useVendors();
  const deleteVendor = useDeleteVendor();

  const vendors = vendorsData?.results || [];

  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const matchesSearch =
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.contact_person.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && vendor.active_issues === 0) ||
        (statusFilter === "issues" && vendor.active_issues > 0);

      const reliability = parseFloat(vendor.reliability);
      const matchesReliability =
        reliabilityFilter === "all" ||
        (reliabilityFilter === "high" && reliability >= 4.5) ||
        (reliabilityFilter === "medium" && reliability >= 3.5 && reliability < 4.5) ||
        (reliabilityFilter === "low" && reliability < 3.5);

      return matchesSearch && matchesStatus && matchesReliability;
    });
  }, [vendors, searchTerm, statusFilter, reliabilityFilter]);

  const renderStars = (rating: string | number) => {
    const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < Math.floor(numRating) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
            }`}
          />
        ))}
        <span className="text-sm font-medium ml-1">{numRating.toFixed(1)}</span>
      </div>
    );
  };

  const handleDeleteClick = (id: string, name: string) => {
    setVendorToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (vendorToDelete) {
      deleteVendor.mutate(vendorToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setVendorToDelete(null);
        },
      });
    }
  };

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
                  <p className="text-3xl font-bold">{vendors.filter((v) => v.active_issues === 0).length}</p>
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
                  <p className="text-3xl font-bold">{vendors.reduce((sum, v) => sum + v.orders_count, 0)}</p>
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
                    {vendors.length > 0
                      ? (vendors.reduce((sum, v) => sum + parseFloat(v.reliability), 0) / vendors.length).toFixed(1)
                      : '0.0'}
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
                    {filteredVendors.map((vendor) => (
                      <TableRow
                        key={vendor.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/vendors/${vendor.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center justify-center text-3xl bg-muted rounded-lg w-12 h-12">
                            {vendor.logo}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold">{vendor.name}</p>
                            <a
                              href={vendor.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {vendor.website.replace("https://", "")}
                            </a>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{vendor.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {vendor.lead_time}
                          </Badge>
                        </TableCell>
                        <TableCell>{renderStars(vendor.reliability)}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="font-semibold">
                            {vendor.orders_count}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={vendor.active_issues > 0 ? "destructive" : "default"}
                            className="font-semibold"
                          >
                            {vendor.active_issues}
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
                                handleDeleteClick(vendor.id, vendor.name);
                              }}
                              title="Delete Vendor"
                              disabled={deleteVendor.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading vendors...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Failed to load vendors</h3>
                <p className="text-muted-foreground mb-4">
                  {error instanceof Error ? error.message : 'An error occurred while fetching vendors'}
                </p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete <strong>{vendorToDelete?.name}</strong>.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteVendor.isPending}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={deleteVendor.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteVendor.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageLayout>
  );
};

export default Vendors;
