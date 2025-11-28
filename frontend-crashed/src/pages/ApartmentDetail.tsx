import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Upload, 
  Download, 
  Calendar, 
  MapPin, 
  User, 
  Package, 
  FileSpreadsheet,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apartmentApi, Apartment } from '@/services/api';
import { importApi, ProductCategory, ImportSession } from '@/services/importApi';
import ProductsTable from '@/components/products/ProductsTable';

const ApartmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [importSessions, setImportSessions] = useState<ImportSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      loadApartmentData();
    }
  }, [id]);

  const loadApartmentData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Load apartment details
      const apartmentData = await apartmentApi.getById(id);
      setApartment(apartmentData);
      
      // Load import-related data
      const [categoriesData, sessionsData] = await Promise.all([
        importApi.getProductCategories(id),
        importApi.getImportSessions(id)
      ]);
      
      setCategories(categoriesData);
      setImportSessions(sessionsData);
      
    } catch (error: any) {
      console.error('Error loading apartment data:', error);
      toast({
        title: "Error loading apartment",
        description: error.message || "Failed to load apartment details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      toast({
        title: "Downloading template...",
        description: "Preparing Excel template for download.",
      });

      const blob = await importApi.downloadTemplate();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'product_import_template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Template downloaded",
        description: "Excel template has been downloaded successfully.",
      });
      
    } catch (error: any) {
      toast({
        title: "Download failed",
        description: error.message || "Failed to download template.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'Planning': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-green-100 text-green-800',
      'On Hold': 'bg-red-100 text-red-800',
    };
    
    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const getTotalProducts = () => {
    return categories.reduce((total, category) => total + category.product_count, 0);
  };

  const getSuccessfulImports = () => {
    return importSessions.reduce((total, session) => total + session.successful_imports, 0);
  };

  if (loading) {
    return (
      <PageLayout title="Loading...">
        <div className="p-6">
          <div className="text-center">Loading apartment details...</div>
        </div>
      </PageLayout>
    );
  }

  if (!apartment) {
    return (
      <PageLayout title="Apartment Not Found">
        <div className="p-6">
          <div className="text-center">Apartment not found</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={apartment.name}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/apartments')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Apartments
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{apartment.name}</h1>
              <p className="text-gray-600">{apartment.address}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Template
            </Button>
            <Button 
              onClick={() => navigate('/apartments')}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Import Products
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <div className="mt-2">
                    {getStatusBadge(apartment.status)}
                  </div>
                </div>
                <AlertCircle className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold">{getTotalProducts()}</p>
                </div>
                <Package className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Categories</p>
                  <p className="text-2xl font-bold">{categories.length}</p>
                </div>
                <FileSpreadsheet className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Import Sessions</p>
                  <p className="text-2xl font-bold">{importSessions.length}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products ({getTotalProducts()})</TabsTrigger>
            <TabsTrigger value="categories">Categories ({categories.length})</TabsTrigger>
            <TabsTrigger value="imports">Import History ({importSessions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Apartment Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Apartment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{apartment.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>Designer: {apartment.designer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Start: {apartment.start_date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Due: {apartment.due_date}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  {categories.length === 0 ? (
                    <p className="text-gray-500">No categories yet. Import an Excel file to create categories.</p>
                  ) : (
                    <div className="space-y-2">
                      {categories.slice(0, 5).map((category) => (
                        <div key={category.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <div className="font-medium">{category.name}</div>
                            <div className="text-sm text-gray-500">{category.sheet_name}</div>
                          </div>
                          <Badge variant="outline">{category.product_count} products</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <ProductsTable apartmentId={apartment.id} />
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            {categories.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">No categories found. Import an Excel file to create categories.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Card key={category.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Sheet: {category.sheet_name}</p>
                        <p className="text-sm text-gray-600">Room: {category.room_type}</p>
                        <p className="text-sm text-gray-600">Products: {category.product_count}</p>
                        <p className="text-xs text-gray-400">
                          Imported: {new Date(category.import_date).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="imports" className="space-y-4">
            {importSessions.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">No import sessions found.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {importSessions.map((session) => (
                  <Card key={session.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{session.file_name}</h3>
                          <p className="text-sm text-gray-600">
                            {session.successful_imports} successful, {session.failed_imports} failed
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(session.started_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge 
                            className={
                              session.status === 'completed' ? 'bg-green-100 text-green-800' :
                              session.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {session.status}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">
                            {session.total_sheets} sheets, {session.total_products} products
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default ApartmentDetail;
