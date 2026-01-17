import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function StatisticsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { iconBg: 'bg-blue-500/10' },
        { iconBg: 'bg-yellow-500/10' },
        { iconBg: 'bg-green-500/10' },
        { iconBg: 'bg-orange-500/10' }
      ].map((style, i) => (
        <Card key={i} className="card-hover-effect">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className={`p-2.5 rounded-xl ${style.iconBg}`}>
                <Skeleton className="h-5 w-5 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Deliveries by Vendor Chart */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-40" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-end justify-between gap-2 px-4">
            {/* Bar Chart Skeleton */}
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end gap-2">
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

      {/* Weekly Delivery Trend Chart */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-40" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-end justify-between gap-3 px-4">
            {/* Line Chart Skeleton */}
            {[70, 85, 75, 95, 80, 60, 50].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2">
                <Skeleton className="h-2 w-2 rounded-full" />
                <Skeleton className="w-0.5" style={{ height: `${height}%` }} />
                <Skeleton className="h-3 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function FiltersBarSkeleton() {
  return (
    <div className="flex flex-col gap-3 mb-3">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>

        {/* Search */}
        <Skeleton className="h-11 flex-1 max-w-md rounded-md" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-11 w-[140px] rounded-md" />
        <Skeleton className="h-11 w-[140px] rounded-md" />
      </div>
    </div>
  );
}

export function DeliveriesTableSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto h-[50dvh] overflow-y-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                {['Apartment', 'Vendor', 'Order No', 'Priority', 'ETA', 'Status', 'Tracking', 'Actions'].map((header, i) => (
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
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-28" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-6 w-28 rounded-full" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-1">
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

export function DeliveriesPageSkeleton() {
  return (
    <div className="space-y-4">
      {/* Statistics Cards */}
      <StatisticsCardsSkeleton />

      {/* Charts */}
      <ChartsSkeleton />

      {/* Filters Bar */}
      <FiltersBarSkeleton />

      {/* Deliveries Table */}
      <DeliveriesTableSkeleton />
    </div>
  );
}

export default DeliveriesPageSkeleton;
