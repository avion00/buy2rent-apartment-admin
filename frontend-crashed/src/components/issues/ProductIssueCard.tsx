import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product, Issue } from '@/stores/useDataStore';
import { Package, DollarSign, Hash, Truck, Calendar, ShoppingCart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ProductIssueCardProps {
  product: Product;
  issue: Issue;
}

export function ProductIssueCard({ product, issue }: ProductIssueCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Product Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Product Basic Info */}
        <div className="flex items-start gap-4">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.product}
              className="w-24 h-24 object-cover rounded-lg border"
            />
          ) : (
            <div className="w-24 h-24 bg-muted rounded-lg border flex items-center justify-center">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          
          <div className="flex-1 space-y-2">
            <div>
              <h3 className="font-semibold text-lg">{product.product}</h3>
              <p className="text-sm text-muted-foreground">{product.vendor}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{product.status}</Badge>
              <Badge variant={product.availability === 'In Stock' ? 'default' : 'secondary'}>
                {product.availability}
              </Badge>
              {product.category && (
                <Badge variant="secondary">{product.category}</Badge>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Product Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">SKU</p>
              <p className="text-sm font-medium">{product.sku}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Quantity</p>
              <p className="text-sm font-medium">{product.qty} units</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Unit Price</p>
              <p className="text-sm font-medium">{formatCurrency(product.unitPrice)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Total Value</p>
              <p className="text-sm font-medium">{formatCurrency(product.unitPrice * product.qty)}</p>
            </div>
          </div>

          {product.orderedOn && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Ordered On</p>
                <p className="text-sm font-medium">
                  {new Date(product.orderedOn).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {product.expectedDeliveryDate && (
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Expected Delivery</p>
                <p className="text-sm font-medium">
                  {new Date(product.expectedDeliveryDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {product.room && (
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Room</p>
                <p className="text-sm font-medium">{product.room}</p>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        {product.notes && (
          <>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Product Notes</p>
              <p className="text-sm">{product.notes}</p>
            </div>
          </>
        )}

        {/* Vendor Link */}
        {product.vendorLink && (
          <>
            <Separator />
            <a 
              href={product.vendorLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View on vendor website →
            </a>
          </>
        )}
      </CardContent>
    </Card>
  );
}
