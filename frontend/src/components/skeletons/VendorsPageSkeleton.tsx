import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function StatisticsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[
        { iconBg: 'bg-primary/10' },
        { iconBg: 'bg-green-500/10' },
        { iconBg: 'bg-blue-500/10' },
        { iconBg: 'bg-yellow-500/10' }
      ].map((style, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-9 w-16" />
              </div>
              <div className={`h-10 w-10 rounded-lg ${style.iconBg} flex items-center justify-center`}>
                <Skeleton className="h-6 w-6 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function FiltersBarSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-10 w-[150px] rounded-md" />
            <Skeleton className="h-10 w-[150px] rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function VendorsTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto h-[50dvh] overflow-y-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="px-4 py-3 text-left">
                  <Skeleton className="h-4 w-12" />
                </th>
                <th className="px-4 py-3 text-left">
                  <Skeleton className="h-4 w-24" />
                </th>
                <th className="px-4 py-3 text-left">
                  <Skeleton className="h-4 w-16" />
                </th>
                <th className="px-4 py-3 text-left">
                  <Skeleton className="h-4 w-20" />
                </th>
                <th className="px-4 py-3 text-left">
                  <Skeleton className="h-4 w-20" />
                </th>
                <th className="px-4 py-3 text-center">
                  <Skeleton className="h-4 w-14 mx-auto" />
                </th>
                <th className="px-4 py-3 text-center">
                  <Skeleton className="h-4 w-14 mx-auto" />
                </th>
                <th className="px-4 py-3 text-right">
                  <Skeleton className="h-4 w-16 ml-auto" />
                </th>
              </tr>
            </thead>
            <tbody>
              {[...Array(8)].map((_, i) => (
                <tr key={i} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center bg-muted rounded-lg w-12 h-12">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-36" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, j) => (
                        <Skeleton key={j} className="h-3 w-3 rounded-sm" />
                      ))}
                      <Skeleton className="h-4 w-8 ml-1" />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center">
                      <Skeleton className="h-6 w-8 rounded-full" />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center">
                      <Skeleton className="h-6 w-8 rounded-full" />
                    </div>
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

export function VendorsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <StatisticsCardsSkeleton />

      {/* Filters Bar */}
      <FiltersBarSkeleton />

      {/* Vendors Table */}
      <VendorsTableSkeleton />
    </div>
  );
}

export default VendorsPageSkeleton;
