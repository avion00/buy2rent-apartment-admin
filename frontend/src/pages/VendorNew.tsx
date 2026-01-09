import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  Building2, 
  Phone,
  Mail,
  Globe,
  MapPin,
  User,
  FileCheck,
  DollarSign,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useCreateVendor } from '@/hooks/useVendorApi';

const VendorNew = () => {
  const navigate = useNavigate();
  const createVendor = useCreateVendor();
  const [activeTab, setActiveTab] = useState('basic');
  
  // Basic Info
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [category, setCategory] = useState('');
  
  // Address Info
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');
  
  // Business Info
  const [taxId, setTaxId] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [yearEstablished, setYearEstablished] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');
  
  
  // Terms & Conditions
  const [paymentTerms, setPaymentTerms] = useState('');
  const [deliveryTerms, setDeliveryTerms] = useState('');
  const [warrantyPeriod, setWarrantyPeriod] = useState('');
  const [returnPolicy, setReturnPolicy] = useState('');
  const [minimumOrder, setMinimumOrder] = useState('');
  
  // Additional Info
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    // Validation
    if (!companyName || !email || !contactPerson) {
      toast.error('Please fill in all required fields (Company Name, Contact Person, Email)');
      setActiveTab('basic');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      setActiveTab('basic');
      return;
    }

    // Prepare vendor data
    const vendorData = {
      name: companyName,
      company_name: companyName,
      contact_person: contactPerson,
      email,
      phone: phone || '',
      website: website || '',
      logo: '🏢',
      lead_time: deliveryTerms || '7-14 days',
      address: address || '',
      city: city || '',
      country: country || '',
      postal_code: postalCode || '',
      tax_id: taxId || '',
      business_type: businessType || '',
      year_established: yearEstablished || '',
      employee_count: employeeCount || '',
      category: category || '',
      product_categories: '',
      certifications: '',
      specializations: '',
      payment_terms: paymentTerms || '',
      delivery_terms: deliveryTerms || '',
      warranty_period: warrantyPeriod || '',
      return_policy: returnPolicy || '',
      minimum_order: minimumOrder || '',
      notes: notes || '',
    };

    // Call API to create vendor
    createVendor.mutate(vendorData, {
      onSuccess: () => {
        navigate('/vendors');
      },
    });
  };

  const handleImport = (type: 'excel' | 'csv' | 'docs') => {
    toast.info(`Import from ${type.toUpperCase()} coming soon!`);
  };

  const tabs = ['basic', 'address', 'business', 'terms'];
  const currentTabIndex = tabs.indexOf(activeTab);

  const handleNext = () => {
    if (currentTabIndex < tabs.length - 1) {
      setActiveTab(tabs[currentTabIndex + 1]);
    }
  };

  const handlePrevious = () => {
    if (currentTabIndex > 0) {
      setActiveTab(tabs[currentTabIndex - 1]);
    }
  };

  return (
    <PageLayout title="Add New Vendor">
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
          
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Import Data
            </Button>
            <Button 
              onClick={handleSave} 
              className="gap-2"
              disabled={createVendor.isPending}
            >
              {createVendor.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Vendor
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Import Options */}
        <Card className="border-dashed">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold">Quick Import</h3>
                <p className="text-sm text-muted-foreground">
                  Import vendor data from existing files
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleImport('excel')}
                  className="gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleImport('csv')}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  CSV
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleImport('docs')}
                  className="gap-2"
                >
                  <FileCheck className="h-4 w-4" />
                  Docs
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Form */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor Information</CardTitle>
            <CardDescription>
              Fill in the vendor details below. Fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="address">Address</TabsTrigger>
                <TabsTrigger value="business">Business</TabsTrigger>
                <TabsTrigger value="terms">Terms</TabsTrigger>
              </TabsList>

              {/* Basic Information */}
              <TabsContent value="basic" className="space-y-6 mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">
                      Company Name <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="companyName"
                        placeholder="Enter company name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="furniture">Furniture</SelectItem>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="lighting">Lighting</SelectItem>
                        <SelectItem value="appliances">Appliances</SelectItem>
                        <SelectItem value="textiles">Textiles</SelectItem>
                        <SelectItem value="construction">Construction</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">
                      Contact Person <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="contactPerson"
                        placeholder="Primary contact name"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="contact@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder="+1 (555) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="website"
                        placeholder="https://company.com"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Address Information */}
              <TabsContent value="address" className="space-y-6 mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Street Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="address"
                        placeholder="123 Main Street"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      placeholder="10001"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      placeholder="Country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Business Information */}
              <TabsContent value="business" className="space-y-6 mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID / VAT Number</Label>
                    <Input
                      id="taxId"
                      placeholder="XX-XXXXXXX"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Select value={businessType} onValueChange={setBusinessType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manufacturer">Manufacturer</SelectItem>
                        <SelectItem value="distributor">Distributor</SelectItem>
                        <SelectItem value="wholesaler">Wholesaler</SelectItem>
                        <SelectItem value="retailer">Retailer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yearEstablished">Year Established</Label>
                    <Input
                      id="yearEstablished"
                      placeholder="2020"
                      value={yearEstablished}
                      onChange={(e) => setYearEstablished(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employeeCount">Number of Employees</Label>
                    <Input
                      id="employeeCount"
                      placeholder="50"
                      value={employeeCount}
                      onChange={(e) => setEmployeeCount(e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Terms & Conditions */}
              <TabsContent value="terms" className="space-y-6 mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                    <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment terms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="net-30">Net 30</SelectItem>
                        <SelectItem value="net-60">Net 60</SelectItem>
                        <SelectItem value="net-90">Net 90</SelectItem>
                        <SelectItem value="cod">Cash on Delivery</SelectItem>
                        <SelectItem value="advance">Advance Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryTerms">Delivery Terms</Label>
                    <Input
                      id="deliveryTerms"
                      placeholder="E.g., 7-14 business days"
                      value={deliveryTerms}
                      onChange={(e) => setDeliveryTerms(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="warrantyPeriod">Warranty Period</Label>
                    <Input
                      id="warrantyPeriod"
                      placeholder="E.g., 12 months"
                      value={warrantyPeriod}
                      onChange={(e) => setWarrantyPeriod(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minimumOrder">Minimum Order Value</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="minimumOrder"
                        placeholder="500"
                        value={minimumOrder}
                        onChange={(e) => setMinimumOrder(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="returnPolicy">Return Policy</Label>
                    <Textarea
                      id="returnPolicy"
                      placeholder="Describe return and refund policy"
                      value={returnPolicy}
                      onChange={(e) => setReturnPolicy(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional information about the vendor"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentTabIndex === 0}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex gap-2">
                {currentTabIndex === tabs.length - 1 ? (
                  <Button
                    type="button"
                    onClick={handleSave}
                    disabled={createVendor.isPending}
                    className="gap-2"
                  >
                    {createVendor.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Vendor
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleNext}
                    className="gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default VendorNew;
