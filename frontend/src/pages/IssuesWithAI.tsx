import React, { useState, useEffect } from "react";
import { issueApi } from "@/services/issueApi";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AIEmailDashboard } from "@/components/AIEmailDashboard";
import { AIEmailThreadEnhanced } from "@/components/AIEmailThreadEnhanced";
import {
  AlertCircle,
  Plus,
  Eye,
  Bot,
  Mail,
  CheckCircle2,
  Clock,
  RefreshCw,
  Send,
  XCircle,
  Search,
  Filter,
  Trash2,
  X,
  Edit,
  Download,
  CheckSquare,
  Square,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function IssuesWithAI() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showEmailThread, setShowEmailThread] = useState(false);
  const [activeTab, setActiveTab] = useState("issues");
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [aiFilter, setAiFilter] = useState("all");
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState(null);
  
  // Bulk selection state
  const [selectedIssues, setSelectedIssues] = useState(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await issueApi.getIssues();
      // Handle both response formats
      if (response && typeof response === 'object') {
        if ('results' in response) {
          setIssues(response.results);
          setFilteredIssues(response.results);
        } else if (Array.isArray(response)) {
          setIssues(response);
          setFilteredIssues(response);
        } else {
          setIssues([]);
          setFilteredIssues([]);
        }
      } else {
        setIssues([]);
        setFilteredIssues([]);
      }
    } catch (error) {
      console.error("Failed to fetch issues:", error);
      toast.error("Failed to load issues");
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "issues") {
      fetchIssues();
    }
  }, [activeTab]);

  // Filter issues based on search and filters
  useEffect(() => {
    let filtered = [...issues];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(issue => 
        issue.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.vendor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.apartment_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(issue => 
        (issue.status || issue.resolution_status) === statusFilter
      );
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter(issue => 
        issue.priority?.toLowerCase() === priorityFilter.toLowerCase()
      );
    }

    // AI filter
    if (aiFilter === "ai_active") {
      filtered = filtered.filter(issue => issue.ai_activated);
    } else if (aiFilter === "ai_inactive") {
      filtered = filtered.filter(issue => !issue.ai_activated);
    }

    setFilteredIssues(filtered);
  }, [searchQuery, statusFilter, priorityFilter, aiFilter, issues]);

  const activateAIEmail = async (issueId) => {
    try {
      const response = await issueApi.activateAIEmail(issueId);
      if (response.data?.success) {
        toast.success("AI email activated successfully");
        fetchIssues();
      } else {
        toast.error(response.data?.message || "Failed to activate AI");
      }
    } catch (error) {
      toast.error("Failed to activate AI email");
    }
  };

  const viewEmailThread = (issue) => {
    setSelectedIssue(issue);
    setShowEmailThread(true);
  };

  const handleDeleteIssue = async () => {
    if (!issueToDelete) return;
    
    try {
      await issueApi.deleteIssue(issueToDelete.id);
      toast.success("Issue deleted successfully");
      setDeleteDialogOpen(false);
      setIssueToDelete(null);
      fetchIssues();
    } catch (error) {
      toast.error("Failed to delete issue");
    }
  };

  const confirmDelete = (issue) => {
    setIssueToDelete(issue);
    setDeleteDialogOpen(true);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setAiFilter("all");
  };

  // Bulk selection functions
  const toggleIssueSelection = (issueId) => {
    const newSelected = new Set(selectedIssues);
    if (newSelected.has(issueId)) {
      newSelected.delete(issueId);
    } else {
      newSelected.add(issueId);
    }
    setSelectedIssues(newSelected);
  };

  const selectAllVisible = () => {
    const allIds = new Set(filteredIssues.map(issue => issue.id));
    setSelectedIssues(allIds);
  };

  const deselectAll = () => {
    setSelectedIssues(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedIssues.size === 0) return;
    
    try {
      // Delete all selected issues
      const deletePromises = Array.from(selectedIssues).map(id => 
        issueApi.deleteIssue(id)
      );
      
      await Promise.all(deletePromises);
      
      toast.success(`Deleted ${selectedIssues.size} issues successfully`);
      setBulkDeleteDialogOpen(false);
      setSelectedIssues(new Set());
      fetchIssues();
    } catch (error) {
      toast.error("Failed to delete some issues");
    }
  };

  const exportToCSV = () => {
    const headers = ['Type', 'Description', 'Status', 'Priority', 'Vendor', 'Apartment', 'AI Active'];
    const rows = filteredIssues.map(issue => [
      issue.type || '',
      issue.description || '',
      issue.status || issue.resolution_status || '',
      issue.priority || '',
      issue.vendor_name || '',
      issue.apartment_name || '',
      issue.ai_activated ? 'Yes' : 'No'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `issues_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Issues exported to CSV');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Open: { color: "bg-blue-500", icon: Clock },
      "Pending Vendor Response": { color: "bg-yellow-500", icon: Clock },
      "Resolution Agreed": { color: "bg-green-500", icon: CheckCircle2 },
      Closed: { color: "bg-gray-500", icon: XCircle },
    };
    const config = statusConfig[status] || { color: "bg-gray-500", icon: Clock };
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityColors = {
      high: "bg-red-500",
      medium: "bg-yellow-500",
      low: "bg-blue-500",
    };
    return (
      <Badge className={priorityColors[priority?.toLowerCase()] || "bg-gray-500"}>
        {priority}
      </Badge>
    );
  };


  return (
    <PageLayout title="Issues & AI Email Management">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="ai-email">
            AI Email Dashboard
            <Bot className="ml-2 h-4 w-4" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="issues" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Issues</h2>
            <div className="flex items-center gap-2">
              <Button 
                onClick={exportToCSV}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button onClick={() => navigate("/issues/new")} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Issue
              </Button>
            </div>
          </div>

          {/* Filters Section */}
          <Card className="p-4">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search issues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              {/* Filter Dropdowns */}
              <div className="flex flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="Pending Vendor Response">Pending Response</SelectItem>
                    <SelectItem value="Resolution Agreed">Resolution Agreed</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={aiFilter} onValueChange={setAiFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="AI Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All AI Status</SelectItem>
                    <SelectItem value="ai_active">AI Active</SelectItem>
                    <SelectItem value="ai_inactive">AI Inactive</SelectItem>
                  </SelectContent>
                </Select>

                {(searchQuery || statusFilter !== "all" || priorityFilter !== "all" || aiFilter !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear Filters
                  </Button>
                )}
              </div>

              {/* Results Count */}
              <div className="text-sm text-muted-foreground">
                Showing {filteredIssues.length} of {issues.length} issues
              </div>
            </div>
          </Card>

          {/* Bulk Actions Bar */}
          {selectedIssues.size > 0 && (
            <Card className="p-3 bg-primary/5 border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">
                    {selectedIssues.size} issue{selectedIssues.size > 1 ? 's' : ''} selected
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={deselectAll}
                  >
                    Clear Selection
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setBulkDeleteDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredIssues.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No issues found</p>
                    <p className="text-sm text-muted-foreground">Create your first issue to get started</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Select All Bar */}
                  <div className="flex items-center justify-between p-2 border-b">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (selectedIssues.size === filteredIssues.length) {
                            deselectAll();
                          } else {
                            selectAllVisible();
                          }
                        }}
                        className="flex items-center gap-2"
                      >
                        {selectedIssues.size === filteredIssues.length ? (
                          <CheckSquare className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                        Select All
                      </Button>
                    </div>
                  </div>
                  
                  {filteredIssues.map((issue) => (
                    <Card key={issue.id} className={`hover:shadow-lg transition-shadow ${selectedIssues.has(issue.id) ? 'ring-2 ring-primary' : ''}`}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => toggleIssueSelection(issue.id)}
                              className="mt-1"
                            >
                              {selectedIssues.has(issue.id) ? (
                                <CheckSquare className="h-5 w-5 text-primary" />
                              ) : (
                                <Square className="h-5 w-5 text-muted-foreground" />
                              )}
                            </button>
                            <div className="space-y-1">
                              <CardTitle className="text-lg">{issue.type}</CardTitle>
                              <p className="text-sm text-muted-foreground">{issue.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getPriorityBadge(issue.priority)}
                            {getStatusBadge(issue.status || issue.resolution_status)}
                          </div>
                        </div>
                      </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {issue.vendor && <span>Vendor: {issue.vendor_name || issue.vendor}</span>}
                          {issue.apartment && <span>Apartment: {issue.apartment_name || issue.apartment}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          {issue.ai_activated ? (
                            <>
                              <Badge className="bg-green-500">
                                <Bot className="h-3 w-3 mr-1" />
                                AI Active
                              </Badge>
                              <Button
                                onClick={() => viewEmailThread(issue)}
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-2"
                              >
                                <Mail className="h-4 w-4" />
                                View Thread & Send
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                onClick={() => activateAIEmail(issue.id)}
                                size="sm"
                                className="flex items-center gap-2"
                              >
                                <Bot className="h-4 w-4" />
                                Activate AI
                              </Button>
                              <Button
                                onClick={() => viewEmailThread(issue)}
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-2"
                              >
                                <Send className="h-4 w-4" />
                                Send Manual
                              </Button>
                            </>
                          )}
                          <Button
                            onClick={() => navigate(`/issues/${issue.id}/edit`)}
                            size="sm"
                            variant="ghost"
                            title="Edit Issue"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => navigate(`/issues/${issue.id}`)}
                            size="sm"
                            variant="ghost"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => confirmDelete(issue)}
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                            title="Delete Issue"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  ))}
                </>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ai-email">
          <AIEmailDashboard />
        </TabsContent>
      </Tabs>

      {/* Email Thread Dialog */}
      <Dialog open={showEmailThread} onOpenChange={setShowEmailThread}>
        <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden" aria-describedby="email-thread-description">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              {selectedIssue?.type || 'Issue'} - Communication Hub
            </DialogTitle>
            <p id="email-thread-description" className="text-sm text-muted-foreground mt-1">
              Manage all vendor communications in one place
            </p>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {selectedIssue && (
              <AIEmailThreadEnhanced
                issueId={selectedIssue.id}
                issueDetails={selectedIssue}
                onClose={() => setShowEmailThread(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Issue</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this issue? This action cannot be undone.
              {issueToDelete && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <p className="font-medium">{issueToDelete.type}</p>
                  <p className="text-sm text-muted-foreground mt-1">{issueToDelete.description}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteIssue}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Issue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIssues.size} Issues</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIssues.size} selected issue{selectedIssues.size > 1 ? 's' : ''}? 
              This action cannot be undone and will permanently remove all selected issues.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete All Selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
