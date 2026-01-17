import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageLayout } from '@/components/layout/PageLayout';

export function BreadcrumbSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="h-4 w-12" />
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="h-10 w-10 rounded-md" />
      <Skeleton className="h-9 w-32" />
    </div>
  );
}

export function ProductFormSkeleton() {
  return (
    <Card>
      <CardContent>
        {/* Tabs */}
        <div className="grid w-full grid-cols-4 gap-1 bg-muted p-1 rounded-lg mt-6">
          <Skeleton className="h-10 rounded-md" />
          <Skeleton className="h-10 rounded-md" />
          <Skeleton className="h-10 rounded-md" />
          <Skeleton className="h-10 rounded-md" />
        </div>

        {/* Tab Content */}
        <div className="space-y-6 mt-6">
          <Skeleton className="h-6 w-48" />

          {/* Row 1: Product Name & Category */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>

          {/* Row 2: Vendor & Link */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>

          {/* Row 3: SKU & Room */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>

          {/* Row 4: Product Image */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-48 w-full rounded-md" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>

          {/* Row 5: Unit Price & Quantity */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>

          {/* Row 6: Availability & Status */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex gap-4 justify-between mt-6 border-t pt-6">
          <Skeleton className="h-10 w-24 rounded-md" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-24 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductEditSkeleton() {
  return (
    <PageLayout title="Loading...">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <BreadcrumbSkeleton />

        {/* Header */}
        <HeaderSkeleton />

        {/* Form */}
        <ProductFormSkeleton />
      </div>
    </PageLayout>
  );
}

export default ProductEditSkeleton;
