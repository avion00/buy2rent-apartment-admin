import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Search, Filter, Package, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

const Products = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const products = [
    {
      id: 1,
      image: "🛋️",
      name: "Modern Sectional Sofa",
      sku: "SOF-2024-001",
      vendor: "IKEA",
      price: 1299.99,
      qty: 1,
      availability: "In Stock",
      orderStatus: "Ordered",
      expectedDelivery: "2024-01-20",
      paymentStatus: "Paid"
    },
    {
      id: 2,
      image: "🛏️",
      name: "Queen Size Bed Frame",
      sku: "BED-2024-012",
      vendor: "Wayfair",
      price: 899.00,
      qty: 1,
      availability: "Low Stock",
      orderStatus: "Pending",
      expectedDelivery: "",
      paymentStatus: "Due"
    },
    {
      id: 3,
      image: "🪑",
      name: "Dining Chair Set (4pc)",
      sku: "CHR-2024-045",
      vendor: "West Elm",
      price: 599.99,
      qty: 4,
      availability: "In Stock",
      orderStatus: "Delivered",
      expectedDelivery: "2024-01-15",
      paymentStatus: "Paid"
    },
    {
      id: 4,
      image: "💡",
      name: "Floor Lamp Modern",
      sku: "LMP-2024-078",
      vendor: "CB2",
      price: 189.99,
      qty: 2,
      availability: "Out of Stock",
      orderStatus: "Pending",
      expectedDelivery: "",
      paymentStatus: "Partial"
    },
    {
      id: 5,
      image: "🖼️",
      name: "Wall Art Canvas Set",
      sku: "ART-2024-023",
      vendor: "Etsy",
      price: 129.99,
      qty: 3,
      availability: "In Stock",
      orderStatus: "Ordered",
      expectedDelivery: "2024-01-18",
      paymentStatus: "Due"
    }
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "Ordered": "bg-primary/10 text-primary",
      "Pending": "bg-warning/10 text-warning",
      "Delivered": "bg-success/10 text-success",
      "In Stock": "bg-success/10 text-success",
      "Low Stock": "bg-warning/10 text-warning",
      "Out of Stock": "bg-danger/10 text-danger",
      "Paid": "bg-success/10 text-success",
      "Partial": "bg-warning/10 text-warning",
      "Due": "bg-danger/10 text-danger"
    };
    return colors[status] || "bg-muted";
  };

  return (
    <PageLayout title="Products">
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name, SKU, or vendor..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent sideOffset={5}>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => console.log('More filters clicked')}>
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">247</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ordered</p>
                  <p className="text-2xl font-bold">168</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Delivered</p>
                  <p className="text-2xl font-bold">112</p>
                </div>
                <Calendar className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Issues</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <AlertCircle className="h-8 w-8 text-danger" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <Card>
          <CardContent className="p-6">
            <div className="overflow-x-auto h-[50dvh] overflow-y-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name / SKU</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead>Expected Delivery</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="text-3xl">{product.image}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.sku}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="link" className="p-0 h-auto">
                        {product.vendor}
                      </Button>
                    </TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.qty}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(product.availability)}>
                        {product.availability}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(product.orderStatus)}>
                        {product.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {product.expectedDelivery || (
                        <Button variant="outline" size="sm">Set Date</Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(product.paymentStatus)}>
                        {product.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">View</Button>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Products;
