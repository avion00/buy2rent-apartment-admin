import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function HeaderActionsSkeleton() {
  return (
    <div className="flex justify-between items-center">
      <Skeleton className="h-11 w-40 rounded-md" />
      <Skeleton className="h-10 w-36 rounded-md" />
    </div>
  );
}

export function StatisticsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { iconBg: 'bg-primary/10' },
        { iconBg: 'bg-green-500/10' },
        { iconBg: 'bg-yellow-500/10' },
        { iconBg: 'bg-red-500/10' }
      ].map((style, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-32" />
                {i === 3 && <Skeleton className="h-3 w-20 mt-1" />}
              </div>
              <div className={`p-3 rounded-lg ${style.iconBg}`}>
                <Skeleton className="h-6 w-6 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function PaymentAnalyticsSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-[130px] rounded-md" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Tabs */}
        <div className="grid w-full grid-cols-3 bg-muted rounded-lg p-1 mb-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-center gap-2 py-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>

        {/* Chart Area */}
        <div className="h-[350px] flex items-end justify-between gap-2 px-4">
          {/* Area Chart Skeleton */}
          {[...Array(12)].map((_, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end gap-1">
              <Skeleton 
                className="w-full rounded-t" 
                style={{ height: `${Math.random() * 60 + 40}%` }} 
              />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function FiltersBarSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Basic Filters */}
        <div className="flex flex-col lg:flex-row gap-3">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 w-[140px] rounded-md" />
          <Skeleton className="h-10 w-[140px] rounded-md" />
          <Skeleton className="h-10 w-[140px] rounded-md" />
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function PaymentsTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                {['Order Ref', 'Vendor', 'Apartment', 'Due Date', 'Total', 'Paid', 'Outstanding', 'Status', 'Actions'].map((header, i) => (
                  <th key={i} className="px-4 py-3 text-left">
                    <Skeleton className="h-4 w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(8)].map((_, i) => (
                <tr key={i} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-5 w-28" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function PaymentsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <HeaderActionsSkeleton />

      {/* Statistics Cards */}
      <StatisticsCardsSkeleton />

      {/* Payment Analytics */}
      <PaymentAnalyticsSkeleton />

      {/* Filters */}
      <FiltersBarSkeleton />

      {/* Payments Table */}
      <PaymentsTableSkeleton />
    </div>
  );
}

export default PaymentsPageSkeleton;
