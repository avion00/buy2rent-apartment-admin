import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageLayout } from '@/components/layout/PageLayout';

export function VendorHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <Skeleton className="h-9 w-40 rounded-md" />
      <Skeleton className="h-9 w-32 rounded-md" />
    </div>
  );
}

export function VendorProfileCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Logo Skeleton */}
          <div className="flex items-center justify-center bg-muted rounded-full w-24 h-24">
            <Skeleton className="w-20 h-20 rounded-full" />
          </div>
          
          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="space-y-2">
                  <Skeleton className="h-9 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-4 rounded-sm" />
                ))}
                <Skeleton className="h-4 w-8 ml-1" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatisticsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[
        { iconBg: 'bg-primary/10' },
        { iconBg: 'bg-red-500/10' },
        { iconBg: 'bg-primary/10' },
        { iconBg: 'bg-green-500/10' }
      ].map((style, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-16" />
              </div>
              <div className={`h-8 w-8 rounded-lg ${style.iconBg} flex items-center justify-center`}>
                <Skeleton className="h-5 w-5 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function VendorTabsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        {/* Tabs List */}
        <div className="grid w-full grid-cols-5 bg-muted rounded-lg p-1 mb-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-center py-2">
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>

        {/* Tab Content - Overview */}
        <div className="space-y-6">
          {/* Contact and Business Details */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="h-px bg-border" />
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="h-px bg-border" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="h-px bg-border" />
            <div className="grid gap-4 md:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="text-center space-y-2">
                      <Skeleton className="h-8 w-8 rounded-lg mx-auto" />
                      <Skeleton className="h-7 w-16 mx-auto" />
                      <Skeleton className="h-3 w-28 mx-auto" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductsTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b">
          <tr>
            {['Image', 'Product Details', 'Category', 'Client', 'Apartment', 'Room', 'Qty', 'Unit Price', 'Total', 'Payment', 'Availability', 'Actions'].map((header, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, i) => (
            <tr key={i} className="border-b">
              <td className="px-4 py-4">
                <Skeleton className="w-16 h-16 rounded-md" />
              </td>
              <td className="px-4 py-4">
                <div className="space-y-2 min-w-[200px]">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </td>
              <td className="px-4 py-4">
                <Skeleton className="h-6 w-24 rounded-full" />
              </td>
              <td className="px-4 py-4">
                <div className="space-y-2 min-w-[150px]">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="space-y-2 min-w-[150px]">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </td>
              <td className="px-4 py-4">
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="px-4 py-4 text-right">
                <Skeleton className="h-4 w-12 ml-auto" />
              </td>
              <td className="px-4 py-4 text-right">
                <Skeleton className="h-4 w-24 ml-auto" />
              </td>
              <td className="px-4 py-4 text-right">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28 ml-auto" />
                  <Skeleton className="h-3 w-20 ml-auto" />
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="space-y-2 min-w-[120px]">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </td>
              <td className="px-4 py-4">
                <Skeleton className="h-6 w-20 rounded-full" />
              </td>
              <td className="px-4 py-4 text-right">
                <Skeleton className="h-8 w-8 rounded ml-auto" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function VendorViewSkeleton() {
  return (
    <PageLayout title="Loading...">
      <div className="space-y-6">
        {/* Header */}
        <VendorHeaderSkeleton />

        {/* Vendor Profile Card */}
        <VendorProfileCardSkeleton />

        {/* Statistics Cards */}
        <StatisticsCardsSkeleton />

        {/* Tabs with Content */}
        <VendorTabsSkeleton />
      </div>
    </PageLayout>
  );
}

export default VendorViewSkeleton;
