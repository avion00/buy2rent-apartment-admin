import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  title?: string;
}

export function TableSkeleton({ 
  rows = 5, 
  columns = 6, 
  showHeader = true,
  title = "Loading..."
}: TableSkeletonProps) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            {showHeader && (
              <TableHeader>
                <TableRow>
                  {Array.from({ length: columns }).map((_, index) => (
                    <TableHead key={index}>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
            )}
            <TableBody>
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array.from({ length: columns }).map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton 
                        className={`h-4 ${
                          colIndex === 0 ? 'w-32' : 
                          colIndex === columns - 1 ? 'w-16' : 
                          'w-24'
                        }`} 
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// Specific skeleton for apartments table
export function ApartmentTableSkeleton() {
  return (
    <TableSkeleton 
      rows={6} 
      columns={10} 
      title="Loading apartments..."
    />
  );
}

// Specific skeleton for clients table
export function ClientTableSkeleton() {
  return (
    <TableSkeleton 
      rows={4} 
      columns={7} 
      title="Loading clients..."
    />
  );
}

// Specific skeleton for products table
export function ProductTableSkeleton() {
  return (
    <TableSkeleton 
      rows={8} 
      columns={12} 
      title="Loading products..."
    />
  );
}
