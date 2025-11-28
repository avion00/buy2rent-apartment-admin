import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EnhancedTextarea } from "@/components/ui/enhanced-textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useApartment, useUpdateApartment, useClients, useCreateClient } from "@/hooks/useApi";
import { useToast } from "@/hooks/use-toast";
import { DetailViewSkeleton } from "@/components/skeletons/CardSkeleton";
import { AlertCircle } from "lucide-react";
import { ArrowLeft } from "lucide-react";

const ApartmentEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch apartment and clients from API
  const { data: apartment, isLoading: apartmentLoading, error: apartmentError } = useApartment(id || "");
  const { data: clients = [] } = useClients();
  const updateApartmentMutation = useUpdateApartment();
  const createClientMutation = useCreateClient();

  // Predefined designers list
  const [designers] = useState<string[]>([
    "Barbara Kovács",
    "Maria Weber",
    "John Smith",
    "Emma Johnson",
  ]);
  const [customDesigner, setCustomDesigner] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    type: "furnishing" as "furnishing" | "renovating",
    clientId: "",
    clientName: "",
    owner: "",
    address: "",
    designer: "",
    status: "Planning",
    startDate: "",
    dueDate: "",
    notes: "",
    progress: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (apartment) {
      setFormData({
        name: apartment.name,
        type: apartment.type,
        clientId: apartment.client || "",
        clientName: "",
        owner: "", // Will be populated from client data
        address: apartment.address,
        designer: apartment.designer,
        status: apartment.status,
        startDate: apartment.start_date || "",
        dueDate: apartment.due_date || "",
        notes: apartment.notes || "",
        progress: apartment.progress || 0,
      });
    }
  }, [apartment]);

  // Show loading skeleton while data is loading
  if (apartmentLoading) {
    return (
      <PageLayout title="Loading...">
        <div className="space-y-6">
          <DetailViewSkeleton />
        </div>
      </PageLayout>
    );
  }

  // Show error or not found state
  if (apartmentError || !apartment) {
    return (
      <PageLayout title="Apartment Not Found">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Apartment Not Found</h3>
              <p className="text-muted-foreground mb-4">
                {apartmentError ? `Error loading apartment: ${apartmentError.message}` : 'The apartment you are trying to edit does not exist or has been removed.'}
              </p>
              <Button onClick={() => navigate("/apartments")}>Back to Apartments</Button>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Apartment name is required";
    if (!formData.clientId && !formData.clientName.trim()) {
      newErrors.clientId = "Client selection or new client name is required";
    }
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.designer.trim() && !customDesigner.trim()) {
      newErrors.designer = "Designer is required";
    }
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.dueDate) newErrors.dueDate = "Due date is required";

    if (formData.startDate && formData.dueDate) {
      if (new Date(formData.dueDate) < new Date(formData.startDate)) {
        newErrors.dueDate = "Due date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    try {
      let clientId = formData.clientId;

      // Create new client if name provided but no ID selected
      if (!clientId && formData.clientName.trim()) {
        const newClient = await createClientMutation.mutateAsync({
          name: formData.clientName.trim(),
          email: `${formData.clientName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          phone: "",
          account_status: "Active",
          type: "Investor",
          notes: "Created from apartment form",
        });
        clientId = newClient.id;
      }

      // Use custom designer if provided
      const designerName = customDesigner.trim() || formData.designer;

      // Prepare apartment data for API
      const apartmentData = {
        name: formData.name,
        type: formData.type,
        client: clientId,
        address: formData.address,
        designer: designerName,
        status: formData.status,
        start_date: formData.startDate || null,
        due_date: formData.dueDate || null,
        progress: formData.progress,
        notes: formData.notes || '',
      };

      await updateApartmentMutation.mutateAsync({ id: apartment.id, apartment: apartmentData });
      toast({
        title: "Success",
        description: "Apartment updated successfully",
      });
      navigate("/apartments?type=" + formData.type);
    } catch (error) {
      console.error('Update apartment error:', error);
    }
  };

  const handleCreateClient = (clientName: string) => {
    setFormData({ ...formData, clientName, clientId: "" });
  };

  const handleCreateDesigner = (designerName: string) => {
    setCustomDesigner(designerName);
    setFormData({ ...formData, designer: "" });
  };

  return (
    <PageLayout title="Edit Apartment">
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/apartments">Apartments</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/apartments/${apartment.id}`}>{apartment.name}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/apartments/${apartment.id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Edit Apartment</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Apartment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Apartment Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Izabella utca 3 • A/12"
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Type *</Label>
                  <RadioGroup
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as "furnishing" | "renovating" })}
                  >
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="furnishing" id="furnishing" />
                        <Label htmlFor="furnishing" className="font-normal cursor-pointer">
                          Furnishing
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="renovating" id="renovating" />
                        <Label htmlFor="renovating" className="font-normal cursor-pointer">
                          Renovating
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client/Owner *</Label>
                  <Combobox
                    options={clients.map((client) => ({
                      value: client.id,
                      label: client.name,
                      subtitle: client.type,
                    }))}
                    value={formData.clientId}
                    onValueChange={(value) => {
                      setFormData({ ...formData, clientId: value, clientName: "" });
                    }}
                    placeholder="Select client or create new"
                    searchPlaceholder="Search clients..."
                    emptyText="No clients found."
                    allowCreate
                    createLabel="Create new client"
                    onCreateNew={handleCreateClient}
                  />
                  {errors.clientId && <p className="text-sm text-destructive">{errors.clientId}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="designer">Assigned Designer *</Label>
                  <Combobox
                    options={designers.map((designer) => ({
                      value: designer,
                      label: designer,
                    }))}
                    value={formData.designer}
                    onValueChange={(value) => {
                      setFormData({ ...formData, designer: value });
                      setCustomDesigner("");
                    }}
                    placeholder="Select designer or create new"
                    searchPlaceholder="Search designers..."
                    emptyText="No designers found."
                    allowCreate
                    createLabel="Add designer"
                    onCreateNew={handleCreateDesigner}
                  />
                  {errors.designer && <p className="text-sm text-destructive">{errors.designer}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Izabella u. 3, Budapest"
                />
                {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Planning">Planning</SelectItem>
                      <SelectItem value="Design Approved">Design Approved</SelectItem>
                      <SelectItem value="Ordering">Ordering</SelectItem>
                      <SelectItem value="Delivery">Delivery</SelectItem>
                      <SelectItem value="Renovating">Renovating</SelectItem>
                      <SelectItem value="Complete">Complete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                  {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                  {errors.dueDate && <p className="text-sm text-destructive">{errors.dueDate}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="progress">Progress (%)</Label>
                  <Input
                    id="progress"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <EnhancedTextarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about this apartment..."
                  rows={4}
                />
              </div>

              <div className="flex gap-4 justify-end">
                <Button type="button" variant="outline" onClick={() => navigate(`/apartments/${apartment.id}`)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </PageLayout>
  );
};

export default ApartmentEdit;
