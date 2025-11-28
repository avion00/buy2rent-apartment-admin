import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EnhancedTextarea } from "@/components/ui/enhanced-textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useCreateApartment, useClients, useCreateClient } from "@/hooks/useApi";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const ApartmentNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch clients from API
  const { data: clients = [] } = useClients();
  const createApartmentMutation = useCreateApartment();
  const createClientMutation = useCreateClient();

  // Predefined designers list (can be fetched from API in future)
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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
        progress: 0,
        notes: formData.notes || '',
      };

      await createApartmentMutation.mutateAsync(apartmentData);
      toast({
        title: "Success",
        description: "Apartment created successfully",
      });
      navigate("/apartments?type=" + formData.type);
    } catch (error) {
      console.error('Create apartment error:', error);
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
    <PageLayout title="New Apartment">
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/apartments">Apartments</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>New Apartment</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/apartments")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">New Apartment</h1>
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

              <div className="grid gap-4 md:grid-cols-3">
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
                <Button type="button" variant="outline" onClick={() => navigate("/apartments")}>
                  Cancel
                </Button>
                <Button type="submit">Create Apartment</Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </PageLayout>
  );
};

export default ApartmentNew;
