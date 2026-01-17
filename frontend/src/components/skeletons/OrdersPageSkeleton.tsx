import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function StatisticsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { iconBg: 'bg-primary/10' },
        { iconBg: 'bg-primary/10' },
        { iconBg: 'bg-primary/10' },
        { iconBg: 'bg-primary/10' }
      ].map((style, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className={`h-12 w-12 rounded-full ${style.iconBg} flex items-center justify-center`}>
                <Skeleton className="h-6 w-6 rounded" />
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
      {/* Spending by Vendor Chart */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="h-[280px] p-4">
            <div className="flex items-end justify-between h-full gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2">
                  <Skeleton 
                    className="w-full rounded-t-lg" 
                    style={{ height: `${Math.random() * 60 + 40}%` }}
                  />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Order Trends Chart */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="h-[280px] p-4">
            <div className="h-full flex flex-col justify-between">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-2 w-12" />
                  <Skeleton 
                    className="h-2 rounded-full" 
                    style={{ width: `${Math.random() * 60 + 20}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function FiltersBarSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Skeleton className="h-10 flex-1 rounded-md" />
      <Skeleton className="h-10 w-[180px] rounded-md" />
      <Skeleton className="h-10 w-[180px] rounded-md" />
      <Skeleton className="h-10 w-36 rounded-md" />
      <Skeleton className="h-10 w-36 rounded-md" />
    </div>
  );
}

export function OrdersTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto h-[50dvh] overflow-y-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                {['PO Number', 'Apartment', 'Vendor', 'Items', 'Total', 'Confirmation', 'Tracking', 'Status', 'Placed On', 'Actions'].map((header, i) => (
                  <th key={i} className="px-4 py-3 text-left">
                    <Skeleton className="h-4 w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(8)].map((_, i) => (
                <tr key={i} className="border-b">
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-28" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-20" />
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
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Skeleton className="h-8 w-8 rounded ml-auto" />
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

export function OrdersPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <StatisticsCardsSkeleton />

      {/* Charts */}
      <ChartsSkeleton />

      {/* Filters Bar */}
      <FiltersBarSkeleton />

      {/* Orders Table */}
      <OrdersTableSkeleton />
    </div>
  );
}

export default OrdersPageSkeleton;
