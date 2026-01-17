import React, { useState, useMemo, useEffect, useCallback } from "react";
import { issueApi } from "@/services/issueApi";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertCircle,
  Package,
  ArrowRight,
  Filter,
  Search,
  Download,
  Plus,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Image as ImageIcon,
  FileText,
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  BarChart3,
  Grid3x3,
  List,
  Kanban,
  ChevronDown,
  ChevronUp,
  X,
  Mail,
  Phone,
  Bot,
  Send,
  Paperclip,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Archive,
  Timer,
  Target,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useDataStore } from "@/stores/useDataStore";
import { format, differenceInDays, subDays } from "date-fns";
import { IssueManagementModal } from "@/components/modals/IssueManagementModal";
import * as XLSX from "xlsx";
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
import { IssuesPageSkeleton } from "@/components/skeletons/IssuesPageSkeleton";

const Issues = () => {
  const navigate = useNavigate();
  const { apartments, products, vendors, updateIssue } = useDataStore();
  
  // API Issues state
  const [apiIssues, setApiIssues] = useState<any[]>([]);
  const [issuesLoading, setIssuesLoading] = useState(true);
  
  // Fetch issues from API
  useEffect(() => {
    const fetchIssues = async () => {
      setIssuesLoading(true);
      try {
        const response = await issueApi.getIssues({ page_size: 100 });
        setApiIssues(response.results || []);
      } catch (error) {
        console.error('Failed to fetch issues:', error);
        toast.error('Failed to load issues');
      } finally {
        setIssuesLoading(false);
      }
    };
    fetchIssues();
  }, []);
  
  // Use API issues
  const issues = apiIssues;

  // View Mode
  const [viewMode, setViewMode] = useState<"kanban" | "table" | "grid">("kanban");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [apartmentFilter, setApartmentFilter] = useState("All");
  const [vendorFilter, setVendorFilter] = useState("All");
  const [assigneeFilter, setAssigneeFilter] = useState("All");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Modal states
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mock priority data (in real app, this would come from the store)
  const issuePriorities = useMemo(() => {
    const priorities: Record<string, "Critical" | "High" | "Medium" | "Low"> = {};
    issues.forEach((issue, index) => {
      priorities[issue.id] = ["Critical", "High", "Medium", "Low"][index % 4] as any;
    });
    return priorities;
  }, [issues]);

  // Mock assignees
  const assignees = ["Admin", "Barbara Kovács", "Maria Weber", "Unassigned"];

  // Get helper functions
  const getApartmentName = (apartmentId: string) => {
    const apt = apartments.find((a) => a.id === apartmentId);
    return apt?.name || "Unknown";
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      Critical: "bg-danger/10 text-danger border-danger/20",
      High: "bg-warning/10 text-warning border-warning/20",
      Medium: "bg-primary/10 text-primary border-primary/20",
      Low: "bg-muted text-muted-foreground border-border",
    };
    return colors[priority] || colors.Low;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Open: "bg-danger/10 text-danger border-danger/20",
      "Pending Vendor Response": "bg-warning/10 text-warning border-warning/20",
      "Resolution Agreed": "bg-primary/10 text-primary border-primary/20",
      Closed: "bg-success/10 text-success border-success/20",
    };
    return colors[status] || colors.Open;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Broken/Damaged":
        return <AlertCircle className="h-4 w-4" />;
      case "Wrong Item/Color":
        return <XCircle className="h-4 w-4" />;
      case "Missing Parts":
        return <Package className="h-4 w-4" />;
      case "Incorrect Quantity":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Filter issues - updated for API data structure
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const apartmentName = issue.apartment_details?.name || issue.apartment_name || getApartmentName(issue.apartment);
      const productName = issue.display_product_name || issue.product_name || issue.product_details?.product || '';
      const vendorName = issue.vendor_name || issue.vendor_details?.name || issue.vendor || '';
      const priority = issue.priority || issuePriorities[issue.id];

      const matchesSearch =
        productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apartmentName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "All" || issue.status === statusFilter;
      const matchesType = typeFilter === "All" || issue.type?.includes(typeFilter);
      const matchesPriority = priorityFilter === "All" || priority === priorityFilter;
      const matchesApartment = apartmentFilter === "All" || issue.apartment === apartmentFilter;
      const matchesVendor = vendorFilter === "All" || issue.vendor === vendorFilter || vendorName === vendorFilter;

      return matchesSearch && matchesStatus && matchesType && matchesPriority && matchesApartment && matchesVendor;
    });
  }, [issues, searchQuery, statusFilter, typeFilter, priorityFilter, apartmentFilter, vendorFilter, issuePriorities]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredIssues.length;
    const open = filteredIssues.filter((i) => i.status === "Open").length;
    const pending = filteredIssues.filter((i) => i.status === "Pending Vendor Response").length;
    const resolved = filteredIssues.filter((i) => i.status === "Resolution Agreed").length;
    const closed = filteredIssues.filter((i) => i.status === "Closed").length;
    const critical = filteredIssues.filter((i) => (i.priority || issuePriorities[i.id]) === "Critical").length;
    const withAI = filteredIssues.filter((i) => i.ai_activated).length;

    // Calculate average resolution time (mock data)
    const avgResolutionDays = 5.2;

    return {
      total,
      open,
      pending,
      resolved,
      closed,
      critical,
      withAI,
      avgResolutionDays,
    };
  }, [filteredIssues, issuePriorities]);

  // Group issues by status for kanban
  const issuesByStatus = useMemo(() => {
    const grouped: Record<string, typeof filteredIssues> = {
      Open: [],
      "Pending Vendor Response": [],
      "Resolution Agreed": [],
      Closed: [],
    };

    filteredIssues.forEach((issue) => {
      if (grouped[issue.status]) {
        grouped[issue.status].push(issue);
      }
    });

    return grouped;
  }, [filteredIssues]);

  // Chart data
  const issuesTrendData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      data.push({
        date: format(date, "MMM dd"),
        reported: Math.floor(Math.random() * 5) + 1,
        resolved: Math.floor(Math.random() * 4),
      });
    }
    return data;
  }, []);

  const issueTypeData = useMemo(() => {
    const types = ["Broken/Damaged", "Wrong Item/Color", "Missing Parts", "Incorrect Quantity"];
    return types
      .map((type) => ({
        name: type,
        value: filteredIssues.filter((i) => i.type === type).length,
        color: ["hsl(var(--danger))", "hsl(var(--warning))", "hsl(var(--primary))", "hsl(var(--success))"][
          types.indexOf(type)
        ],
      }))
      .filter((item) => item.value > 0);
  }, [filteredIssues]);

  // Get unique vendors - use vendor_name from API
  const uniqueVendors = Array.from(new Set(issues.map((i) => i.vendor_name || i.vendor_details?.name || i.vendor))).filter(Boolean).sort();

  // Clear filters
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setTypeFilter("All");
    setPriorityFilter("All");
    setApartmentFilter("All");
    setVendorFilter("All");
    setAssigneeFilter("All");
  };

  const activeFiltersCount = [
    searchQuery,
    statusFilter !== "All",
    typeFilter !== "All",
    priorityFilter !== "All",
    apartmentFilter !== "All",
    vendorFilter !== "All",
    assigneeFilter !== "All",
  ].filter(Boolean).length;

  const handleViewIssue = (issue: any) => {
    navigate(`/issues/${issue.id}`);
  };

  const handleEditIssue = (e: React.MouseEvent, issue: any) => {
    e.stopPropagation();
    navigate(`/issues/${issue.id}/edit`);
  };

  const handleDeleteClick = (e: React.MouseEvent, issue: any) => {
    e.stopPropagation();
    setIssueToDelete(issue);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!issueToDelete) return;
    
    setIsDeleting(true);
    try {
      await issueApi.deleteIssue(issueToDelete.id);
      toast.success('Issue deleted successfully');
      // Refresh the issues list
      const response = await issueApi.getIssues({});
      setApiIssues(response.results || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete issue');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setIssueToDelete(null);
    }
  };

  const handleExport = () => {
    try {
      // Prepare data for export - updated for API data structure
      const exportData = filteredIssues.map((issue) => ({
        "Issue ID": issue.id,
        Product: issue.display_product_name || issue.product_name || issue.product_details?.product || 'Unknown',
        Type: issue.type,
        Priority: issue.priority || issuePriorities[issue.id],
        Status: issue.status,
        Apartment: issue.apartment_details?.name || issue.apartment_name || getApartmentName(issue.apartment),
        Vendor: issue.vendor_name || issue.vendor_details?.name || issue.vendor,
        Description: issue.description,
        "Reported Date": issue.reported_on ? format(new Date(issue.reported_on), "yyyy-MM-dd") : 'Unknown',
        "Days Open": issue.reported_on ? differenceInDays(new Date(), new Date(issue.reported_on)) : 0,
        "AI Active": issue.ai_activated ? "Yes" : "No",
        Photos: issue.photos?.length || 0,
        Communications: issue.ai_communication_log?.length || 0,
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const colWidths = [
        { wch: 15 }, // Issue ID
        { wch: 30 }, // Product
        { wch: 20 }, // Type
        { wch: 10 }, // Priority
        { wch: 20 }, // Status
        { wch: 20 }, // Apartment
        { wch: 20 }, // Vendor
        { wch: 40 }, // Description
        { wch: 12 }, // Reported Date
        { wch: 10 }, // Days Open
        { wch: 10 }, // AI Active
        { wch: 8 }, // Photos
        { wch: 15 }, // Communications
      ];
      ws["!cols"] = colWidths;

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Issues");

      // Generate file name with timestamp
      const fileName = `Issues_Report_${format(new Date(), "yyyy-MM-dd_HHmmss")}.xlsx`;

      // Save file
      XLSX.writeFile(wb, fileName);

      toast.success("Export Complete", {
        description: `Downloaded ${filteredIssues.length} issues to ${fileName}`,
      });
    } catch (error) {
      toast.error("Export Failed", {
        description: "Failed to generate the export file",
      });
    }
  };

  const handleBulkEmail = () => {
    if (filteredIssues.length === 0) {
      toast.error("No issues to email");
      return;
    }
    navigate('/issues/bulk-email', { state: { selectedIssues: filteredIssues } });
  };

  // Drag and drop handler for Kanban board
  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // Dropped in the same position
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const newStatus = destination.droppableId;
    const issueId = draggableId;

    // Find the issue
    const issue = filteredIssues.find(i => i.id === issueId);
    if (!issue) return;

    // If status hasn't changed, do nothing
    if (issue.status === newStatus) return;

    try {
      // Optimistically update the UI
      toast.loading(`Moving issue to ${newStatus}...`, { id: 'drag-status' });

      // Call API to update status
      await issueApi.updateIssue(issueId, { status: newStatus });

      // Refresh the issues list
      const response = await issueApi.getIssues();
      setApiIssues(response.results || []);

      toast.success(`Issue moved to ${newStatus}`, { id: 'drag-status' });
    } catch (error) {
      console.error('Failed to update issue status:', error);
      toast.error('Failed to update issue status', { id: 'drag-status' });
    }
  }, [filteredIssues]);

  // Show skeleton while loading
  if (issuesLoading) {
    return (
      <PageLayout title="Issues Management">
        <IssuesPageSkeleton viewMode={viewMode} />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Issues Management">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              size="lg"
              className="h-11 shadow-lg hover:shadow-xl transition-shadow"
              onClick={() => navigate('/issues/new')}
            >
              <Plus className="h-5 w-5 mr-2" />
              Report Issue
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-11 shadow-sm hover:shadow-md transition-shadow"
              onClick={handleBulkEmail}
            >
              <Mail className="h-4 w-4 mr-2" />
              Bulk Email
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport} className="shadow-sm hover:shadow-md transition-shadow">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="shadow-sm hover:shadow-md transition-shadow ">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Total Issues</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow-md transition-shadow ">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="h-5 w-5 text-danger" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Open</p>
                <p className="text-2xl font-bold text-danger">{stats.open}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow-md transition-shadow ">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-warning">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow-md transition-shadow ">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-primary">{stats.resolved}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow-md transition-shadow ">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Closed</p>
                <p className="text-2xl font-bold text-success">{stats.closed}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow-md transition-shadow ">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Zap className="h-5 w-5 text-danger" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-danger">{stats.critical}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow-md transition-shadow  bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">AI Active</p>
                <p className="text-2xl font-bold text-primary">{stats.withAI}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow-md transition-shadow ">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Timer className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Avg Resolution</p>
                <p className="text-2xl font-bold">{stats.avgResolutionDays}d</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-md ">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Issues Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={issuesTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="reported"
                    stroke="hsl(var(--danger))"
                    strokeWidth={2}
                    name="Reported"
                  />
                  <Line
                    type="monotone"
                    dataKey="resolved"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    name="Resolved"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-md ">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Issue Types Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={issueTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name.split("/")[0]}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {issueTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Main Search and Quick Filters */}
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search issues by product, description, vendor, or apartment..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex gap-2 flex-wrap lg:flex-nowrap">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Status</SelectItem>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="Pending Vendor Response">Pending</SelectItem>
                      <SelectItem value="Resolution Agreed">Resolved</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Types</SelectItem>
                      <SelectItem value="Broken/Damaged">Damaged</SelectItem>
                      <SelectItem value="Wrong Item/Color">Wrong Item</SelectItem>
                      <SelectItem value="Missing Parts">Missing</SelectItem>
                      <SelectItem value="Incorrect Quantity">Quantity</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant={showAdvancedFilters ? "default" : "outline"}
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="relative"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-primary-foreground text-primary">
                        {activeFiltersCount}
                      </Badge>
                    )}
                    {showAdvancedFilters ? (
                      <ChevronUp className="h-4 w-4 ml-2" />
                    ) : (
                      <ChevronDown className="h-4 w-4 ml-2" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="pt-4 border-t space-y-4 animate-slide-down">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold">Advanced Filters</h4>
                    {activeFiltersCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs">
                        <X className="h-3 w-3 mr-1" />
                        Clear All
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Priority</Label>
                      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Priorities" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Priorities</SelectItem>
                          <SelectItem value="Critical">Critical</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Apartment</Label>
                      <Select value={apartmentFilter} onValueChange={setApartmentFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Apartments" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Apartments</SelectItem>
                          {apartments.map((apt) => (
                            <SelectItem key={apt.id} value={apt.id}>
                              {apt.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Vendor</Label>
                      <Select value={vendorFilter} onValueChange={setVendorFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Vendors" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Vendors</SelectItem>
                          {uniqueVendors.map((vendor) => (
                            <SelectItem key={vendor} value={vendor}>
                              {vendor}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Assigned To</Label>
                      <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Assignees" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Assignees</SelectItem>
                          {assignees.map((assignee) => (
                            <SelectItem key={assignee} value={assignee}>
                              {assignee}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Results Count and View Mode */}
              <div className="flex items-center justify-between pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{filteredIssues.length}</span> of{" "}
                  <span className="font-semibold text-foreground">{issues.length}</span> issues
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant={viewMode === "kanban" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("kanban")}
                  >
                    <Kanban className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kanban View with Drag & Drop */}
        {viewMode === "kanban" && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="overflow-x-auto">
              <div className="flex gap-4 pb-4" style={{ minWidth: "min-content" }}>
                {Object.entries(issuesByStatus).map(([status, statusIssues]) => (
                  <div key={status} className="flex-shrink-0 w-96">
                    <Card className="h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-semibold">{status}</CardTitle>
                          <Badge className={getStatusColor(status)}>{statusIssues.length}</Badge>
                        </div>
                      </CardHeader>
                      <Droppable droppableId={status}>
                        {(provided, snapshot) => (
                          <CardContent 
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={cn(
                              "space-y-3 max-h-[600px] overflow-y-auto min-h-[100px] transition-colors",
                              snapshot.isDraggingOver && "bg-primary/5 border-2 border-dashed border-primary/30 rounded-lg"
                            )}
                          >
                            {statusIssues.map((issue, index) => {
                              const priority = issue.priority || issuePriorities[issue.id];
                              const daysOpen = issue.reported_on ? differenceInDays(new Date(), new Date(issue.reported_on)) : 0;

                              return (
                                <Draggable key={issue.id} draggableId={issue.id} index={index}>
                                  {(provided, snapshot) => (
                                    <Card
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={cn(
                                        "hover:shadow-md transition-all cursor-grab border-l-4",
                                        snapshot.isDragging && "shadow-xl rotate-2 cursor-grabbing ring-2 ring-primary"
                                      )}
                                      style={{
                                        ...provided.draggableProps.style,
                                        borderLeftColor:
                                          priority === "Critical"
                                            ? "hsl(var(--danger))"
                                            : priority === "High"
                                              ? "hsl(var(--warning))"
                                              : "hsl(var(--border))",
                                      }}
                                      onClick={() => !snapshot.isDragging && handleViewIssue(issue)}
                                    >
                                      <CardContent className="p-3 space-y-2">
                                        {(() => {
                                          const items = issue.items || [];
                                          const itemsCount = items.length || issue.items_count || 0;
                                          const displayItems = itemsCount > 0 ? items.slice(0, 4) : [];
                                          const remainingCount = Math.max(0, itemsCount - 4);
                                          
                                          // Get single product image for fallback
                                          const singleProductImage = items[0]?.product_image ||
                                            issue.order_item_details?.product_image || 
                                            issue.product_details?.product_image;

                                          return (
                                            <>
                                              {/* Header */}
                                              <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                  {getTypeIcon(issue.type)}
                                                  <span className="font-semibold text-sm truncate">
                                                    {issue.display_product_name || issue.product_name || issue.product_details?.product || 'Unknown'}
                                                  </span>
                                                </div>
                                                <Badge className={getPriorityColor(priority)} variant="outline">
                                                  {priority}
                                                </Badge>
                                              </div>

                                              {/* Description */}
                                              <p className="text-xs text-muted-foreground line-clamp-2">
                                                {issue.description}
                                              </p>

                                              {/* Badges Row */}
                                              <div className="flex items-center gap-2 flex-wrap">
                                                <Badge variant="outline" className="text-xs">
                                                  {issue.apartment_details?.name || issue.apartment_name || getApartmentName(issue.apartment)}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                  {issue.vendor_name || issue.vendor_details?.name || issue.vendor}
                                                </Badge>
                                                {issue.ai_activated && (
                                                  <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                                                    <Bot className="h-3 w-3 mr-1" />
                                                    AI
                                                  </Badge>
                                                )}
                                              </div>

                                              {/* Footer with time, actions, and stacked product images */}
                                              <div className="flex items-center justify-between pt-1">
                                                <div className="flex items-center gap-2">
                                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {daysOpen}d ago
                                                  </div>
                                                  {/* Edit/Delete Actions */}
                                                  <div className="flex items-center gap-0.5">
                                                    <button
                                                      onClick={(e) => handleEditIssue(e, issue)}
                                                      className="p-1 rounded hover:bg-muted transition-colors"
                                                      title="Edit Issue"
                                                    >
                                                      <Edit className="h-3 w-3 text-muted-foreground hover:text-primary" />
                                                    </button>
                                                    <button
                                                      onClick={(e) => handleDeleteClick(e, issue)}
                                                      className="p-1 rounded hover:bg-destructive/10 transition-colors"
                                                      title="Delete Issue"
                                                    >
                                                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                                                    </button>
                                                  </div>
                                                </div>
                                                
                                                {/* Stacked Product Images - Bottom Right */}
                                                <div className="flex items-center -space-x-2">
                                                  {itemsCount > 0 ? (
                                                    <>
                                                      {displayItems.map((item, idx) => (
                                                        <div 
                                                          key={item.id || idx} 
                                                          className="relative"
                                                          style={{ zIndex: 10 - idx }}
                                                        >
                                                          {item.product_image ? (
                                                            <img 
                                                              src={item.product_image} 
                                                              alt={item.product_name || 'Product'} 
                                                              className="w-7 h-7 rounded-full object-cover border-2 border-background shadow-sm"
                                                            />
                                                          ) : (
                                                            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center border-2 border-background shadow-sm">
                                                              <Package className="h-3 w-3 text-muted-foreground" />
                                                            </div>
                                                          )}
                                                        </div>
                                                      ))}
                                                      {remainingCount > 0 && (
                                                        <div 
                                                          className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center border-2 border-background shadow-sm text-[10px] font-semibold text-primary"
                                                          style={{ zIndex: 1 }}
                                                        >
                                                          +{remainingCount}
                                                        </div>
                                                      )}
                                                    </>
                                                  ) : singleProductImage ? (
                                                    <img 
                                                      src={singleProductImage} 
                                                      alt={issue.display_product_name || 'Product'} 
                                                      className="w-7 h-7 rounded-full object-cover border-2 border-background shadow-sm"
                                                    />
                                                  ) : (
                                                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center border-2 border-background shadow-sm">
                                                      <Package className="h-3 w-3 text-muted-foreground" />
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </>
                                          );
                                        })()}
                                      </CardContent>
                                    </Card>
                                  )}
                                </Draggable>
                              );
                            })}
                            {provided.placeholder}
                            {statusIssues.length === 0 && !snapshot.isDraggingOver && (
                              <div className="text-center py-12 text-sm text-muted-foreground">
                                <Package className="h-12 w-12 mx-auto mb-2 text-muted-foreground/30" />
                                No issues
                              </div>
                            )}
                            {statusIssues.length === 0 && snapshot.isDraggingOver && (
                              <div className="text-center py-8 text-sm text-primary">
                                <Package className="h-10 w-10 mx-auto mb-2 text-primary/50" />
                                Drop here to move to {status}
                              </div>
                            )}
                          </CardContent>
                        )}
                      </Droppable>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </DragDropContext>
        )}

        {/* Table View */}
        {viewMode === "table" && (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto h-[50dvh] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Issue</TableHead>
                      <TableHead className="font-semibold">Product</TableHead>
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Priority</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Apartment</TableHead>
                      <TableHead className="font-semibold">Vendor</TableHead>
                      <TableHead className="font-semibold">Reported</TableHead>
                      <TableHead className="font-semibold">AI</TableHead>
                      <TableHead className="font-semibold text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIssues.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                          <AlertCircle className="h-12 w-12 mx-auto mb-2 text-muted-foreground/30" />
                          <p>No issues found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredIssues.map((issue) => {
                        const priority = issue.priority || issuePriorities[issue.id];
                        const daysOpen = issue.reported_on ? differenceInDays(new Date(), new Date(issue.reported_on)) : 0;

                        return (
                          <TableRow key={issue.id} className="hover:bg-muted/50">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getTypeIcon(issue.type)}
                                <span className="font-mono text-xs text-muted-foreground">#{issue.id.slice(-6)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{issue.display_product_name || issue.product_name || issue.product_details?.product || 'Unknown'}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">{issue.description}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {issue.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getPriorityColor(priority)} variant="outline">
                                {priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(issue.status)}>{issue.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{issue.apartment_details?.name || issue.apartment_name || getApartmentName(issue.apartment)}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{issue.vendor_name || issue.vendor_details?.name || issue.vendor}</span>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p>{issue.reported_on ? format(new Date(issue.reported_on), "MMM dd, yyyy") : 'Unknown'}</p>
                                <p className="text-xs text-muted-foreground">{daysOpen}d ago</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {issue.ai_activated ? (
                                <div className="flex items-center gap-1 text-primary">
                                  <Bot className="h-4 w-4" />
                                  <span className="text-xs">Active</span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Button variant="ghost" size="sm" onClick={() => handleViewIssue(issue)} title="View">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={(e) => handleEditIssue(e, issue)} title="Edit">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={(e) => handleDeleteClick(e, issue)} title="Delete" className="hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIssues.map((issue) => {
              const priority = issue.priority || issuePriorities[issue.id];
              const daysOpen = issue.reported_on ? differenceInDays(new Date(), new Date(issue.reported_on)) : 0;

              return (
                <Card
                  key={issue.id}
                  className="hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => handleViewIssue(issue)}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(issue.type)}
                        <Badge className={getPriorityColor(priority)} variant="outline">
                          {priority}
                        </Badge>
                      </div>
                      <Badge className={getStatusColor(issue.status)}>{issue.status}</Badge>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-1">{issue.display_product_name || issue.product_name || issue.product_details?.product || 'Unknown'}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{issue.description}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {issue.apartment_details?.name || issue.apartment_name || getApartmentName(issue.apartment)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {issue.vendor_name || issue.vendor_details?.name || issue.vendor}
                      </Badge>
                      {issue.ai_activated && (
                        <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                          <Bot className="h-3 w-3 mr-1" />
                          AI Active
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {daysOpen} days ago
                        </div>
                        {/* Edit/Delete Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleEditIssue(e, issue)}
                            className="p-1.5 rounded hover:bg-muted transition-colors"
                            title="Edit Issue"
                          >
                            <Edit className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(e, issue)}
                            className="p-1.5 rounded hover:bg-destructive/10 transition-colors"
                            title="Delete Issue"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {issue.photos && issue.photos.length > 0 && (
                          <div className="flex items-center gap-1">
                            <ImageIcon className="h-3 w-3" />
                            {issue.photos.length}
                          </div>
                        )}
                        {issue.aiCommunicationLog && issue.aiCommunicationLog.length > 0 && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {issue.aiCommunicationLog.length}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filteredIssues.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-2 text-muted-foreground/30" />
                <p>No issues found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Issue Management Modal */}
      {selectedIssue && (
        <IssueManagementModal product={selectedIssue} open={isIssueModalOpen} onOpenChange={setIsIssueModalOpen} />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
          {issueToDelete && (
            <div className="py-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm font-medium text-foreground">
                  {issueToDelete.display_product_name || issueToDelete.product_name || issueToDelete.type || 'Issue'}
                </p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {issueToDelete.description?.slice(0, 100)}{issueToDelete.description && issueToDelete.description.length > 100 ? '...' : ''}
                </p>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
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
    </PageLayout>
  );
};

export default Issues;
