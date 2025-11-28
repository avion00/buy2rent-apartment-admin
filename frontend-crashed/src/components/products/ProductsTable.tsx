import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Eye, Edit, ExternalLink, Package, MapPin } from 'lucide-react';
import { importApi, Product, ProductCategory } from '@/services/importApi';
import { useToast } from '@/hooks/use-toast';

interface ProductsTableProps {
  apartmentId: string;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({ apartmentId }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [apartmentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load categories
      const categoriesData = await importApi.getProductCategories(apartmentId);
      setCategories(categoriesData);
      
      // Load all products for the apartment
      const productsData = await importApi.getProductsByApartment(apartmentId);
      setProducts(productsData);
      
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({
        title: "Error loading products",
        description: error.message || "Failed to load products data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProductsByCategory = async (categoryId: string) => {
    try {
      if (categoryId === 'all') {
        // Load all products for the apartment
        const productsData = await importApi.getProductsByApartment(apartmentId);
        setProducts(productsData);
        return;
      }
      
      const data = await importApi.getProductsByCategory(categoryId);
      setProducts(data.products);
    } catch (error: any) {
      toast({
        title: "Error loading products",
        description: error.message || "Failed to load products for category",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'Design Approved': 'bg-blue-100 text-blue-800',
      'Ordered': 'bg-yellow-100 text-yellow-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Damaged': 'bg-red-100 text-red-800',
    };
    
    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const formatPrice = (cost: string, allPrice: string) => {
    if (allPrice && allPrice !== cost) {
      return (
        <div className="text-sm">
          <div className="font-medium">{cost}</div>
          <div className="text-gray-500">Total: {allPrice}</div>
        </div>
      );
    }
    return <div className="font-medium">{cost}</div>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading products...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Imported Products ({filteredProducts.length})</span>
          <div className="flex items-center gap-4">
            <Select value={selectedCategory} onValueChange={(value) => {
              setSelectedCategory(value);
              loadProductsByCategory(value);
            }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name} ({category.product_count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No products found. Import an Excel file to see products here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S.N</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Size/NM</TableHead>
                  <TableHead>Package Info</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-sm">
                      {product.sn}
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.product}</div>
                        {product.description && (
                          <div className="text-sm text-gray-500 truncate max-w-48">
                            {product.description}
                          </div>
                        )}
                        {product.sku && (
                          <div className="text-xs text-gray-400">SKU: {product.sku}</div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{product.room}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {(() => {
                        // Try multiple image fields for better compatibility
                        const imageUrl = product.imageUrl || product.product_image || product.image_url;
                        
                        // Debug logging
                        if (process.env.NODE_ENV === 'development') {
                          console.log(`Product ${product.product} image data:`, {
                            imageUrl: product.imageUrl,
                            product_image: product.product_image,
                            image_url: product.image_url,
                            selected: imageUrl
                          });
                        }
                        
                        // Check if we have a valid web-accessible image URL
                        const isValidWebUrl = imageUrl && (
                          imageUrl.startsWith('http://') || 
                          imageUrl.startsWith('https://') ||
                          imageUrl.startsWith('/media/') ||
                          imageUrl.startsWith('/static/')
                        );
                        
                        if (isValidWebUrl) {
                          return (
                            <img 
                              src={imageUrl} 
                              alt={product.product}
                              className="w-12 h-12 object-cover rounded border"
                              onLoad={() => {
                                if (process.env.NODE_ENV === 'development') {
                                  console.log(`✅ Image loaded successfully for ${product.product}:`, imageUrl);
                                }
                              }}
                              onError={(e) => {
                                console.warn(`❌ Failed to load image for product ${product.product}:`, imageUrl);
                                (e.target as HTMLImageElement).style.display = 'none';
                                // Show error placeholder
                                const container = (e.target as HTMLImageElement).parentElement;
                                if (container) {
                                  const errorDiv = document.createElement('div');
                                  errorDiv.className = 'w-12 h-12 bg-red-100 rounded border flex items-center justify-center';
                                  errorDiv.title = `Failed to load: ${imageUrl}`;
                                  errorDiv.innerHTML = '<div class="h-4 w-4 text-red-600">⚠️</div>';
                                  container.appendChild(errorDiv);
                                }
                              }}
                            />
                          );
                        } else if (imageUrl) {
                          // Invalid URL (like file:// protocol)
                          console.warn(`⚠️ Invalid image URL for product ${product.product}:`, imageUrl);
                          return (
                            <div className="w-12 h-12 bg-yellow-100 rounded border flex items-center justify-center" title={`Invalid URL: ${imageUrl}`}>
                              <Package className="h-4 w-4 text-yellow-600" />
                            </div>
                          );
                        } else {
                          // No image URL
                          return (
                            <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center" title="No image available">
                              <Package className="h-4 w-4 text-gray-400" />
                            </div>
                          );
                        }
                      })()}
                    </TableCell>
                    
                    <TableCell className="text-center">
                      {product.qty}
                    </TableCell>
                    
                    <TableCell>
                      {formatPrice(product.cost, product.all_price)}
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        {product.size && <div>Size: {product.size}</div>}
                        {product.nm && <div>NM: {product.nm}</div>}
                        {product.plusz_nm && <div>+NM: {product.plusz_nm}</div>}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        {product.price_per_package && (
                          <div>Price/pkg: {product.price_per_package}</div>
                        )}
                        {product.package_need_to_order && (
                          <div>Need: {product.package_need_to_order}</div>
                        )}
                        {product.all_package && (
                          <div>Total: {product.all_package}</div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {getStatusBadge(product.status)}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {product.link && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(product.link, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
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
  );
};

export default ProductsTable;
