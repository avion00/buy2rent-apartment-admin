import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatCardSkeleton() {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-12" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ChartCardSkeleton() {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Chart bars/lines simulation */}
          <div className="flex items-end justify-between h-[200px] gap-2">
            {[60, 80, 45, 90, 70, 55, 85].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end">
                <Skeleton 
                  className="w-full rounded-t-md" 
                  style={{ height: `${height}%` }}
                />
              </div>
            ))}
          </div>
          {/* X-axis labels */}
          <div className="flex justify-between">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-3 w-12" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PieChartCardSkeleton() {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-40" />
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <div className="relative">
          {/* Pie chart circle */}
          <Skeleton className="h-40 w-40 rounded-full" />
          {/* Center hole for donut effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-20 w-20 rounded-full bg-background" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FiltersSkeleton() {
  return (
    <Card className="shadow-md">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search bar */}
            <Skeleton className="flex-1 h-10 rounded-md" />
            
            {/* Filter dropdowns */}
            <div className="flex gap-2">
              <Skeleton className="h-10 w-[140px] rounded-md" />
              <Skeleton className="h-10 w-[140px] rounded-md" />
              <Skeleton className="h-10 w-[120px] rounded-md" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function KanbanColumnSkeleton() {
  return (
    <div className="flex-1 min-w-[300px]">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-6 w-8 rounded-full" />
      </div>
      
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header with badges */}
                <div className="flex items-start justify-between gap-2">
                  <Skeleton className="h-4 w-24 rounded-full" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
                
                {/* Product name */}
                <Skeleton className="h-5 w-full" />
                
                {/* Description */}
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
                
                {/* Footer info */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b">
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="h-10 w-10 rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-3 w-3/4 max-w-sm" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-24 rounded-full" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </div>
  );
}

export function GridCardSkeleton() {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          
          {/* Image placeholder */}
          <Skeleton className="h-32 w-full rounded-lg" />
          
          {/* Product name */}
          <Skeleton className="h-5 w-full" />
          
          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
          
          {/* Metadata */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-3 w-24" />
          </div>
          
          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-9 flex-1 rounded" />
            <Skeleton className="h-9 w-9 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function IssuesPageSkeleton({ viewMode = "kanban" }: { viewMode?: "kanban" | "table" | "grid" }) {
  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Skeleton className="h-11 w-36 rounded-md" />
          <Skeleton className="h-11 w-32 rounded-md" />
        </div>
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {[...Array(8)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCardSkeleton />
        <PieChartCardSkeleton />
      </div>

      {/* Filters */}
      <FiltersSkeleton />

      {/* View Mode Tabs */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-64 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>

      {/* Content based on view mode */}
      {viewMode === "kanban" && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(4)].map((_, i) => (
            <KanbanColumnSkeleton key={i} />
          ))}
        </div>
      )}

      {viewMode === "table" && (
        <Card className="shadow-md">
          <CardContent className="p-0">
            <div className="space-y-0">
              {/* Table header */}
              <div className="flex items-center gap-4 p-4 border-b bg-muted/50">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32 flex-1" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              
              {/* Table rows */}
              {[...Array(5)].map((_, i) => (
                <TableRowSkeleton key={i} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <GridCardSkeleton key={i} />
          ))}
        </div>
      )}
    </div>
  );
}
