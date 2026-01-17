import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageLayout } from '@/components/layout/PageLayout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ClientViewSkeleton = () => {
  return (
    <PageLayout title="Loading...">
      <div className="space-y-6">
        {/* Breadcrumbs Skeleton */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>

        {/* Premium Hero Section Skeleton */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/3 to-background border border-border/50">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
          <div className="relative p-8">
            {/* Back Button */}
            <Skeleton className="h-9 w-24 rounded-md absolute top-4 left-4" />

            {/* Client Profile Header Skeleton */}
            <div className="flex items-start gap-6 mt-8">
              {/* Avatar Skeleton with Status Badge */}
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 animate-pulse" />
                <Skeleton className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-background" />
              </div>

              <div className="flex-1">
                {/* Name and Badges */}
                <div className="flex items-center gap-3 mb-2">
                  <Skeleton className="h-9 w-48" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>

                {/* Contact Info Grid */}
                <div className="grid grid-cols-3 gap-6 mt-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Notes Skeleton */}
                <div className="mt-4 p-3 rounded-lg bg-background/60 border border-border/50">
                  <div className="flex items-start gap-2">
                    <Skeleton className="h-4 w-4 mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Statistics Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { gradient: 'from-blue-500/5 to-blue-500/0', iconBg: 'bg-blue-500/10', accentBg: 'bg-blue-500/5' },
            { gradient: 'from-amber-500/5 to-amber-500/0', iconBg: 'bg-amber-500/10', accentBg: 'bg-amber-500/5' },
            { gradient: 'from-green-500/5 to-green-500/0', iconBg: 'bg-green-500/10', accentBg: 'bg-green-500/5' },
            { gradient: 'from-orange-500/5 to-orange-500/0', iconBg: 'bg-orange-500/10', accentBg: 'bg-orange-500/5' }
          ].map((style, index) => (
            <Card key={index} className={`border-border/50 bg-gradient-to-br ${style.gradient} hover:shadow-xl transition-all duration-300 group`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl ${style.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Skeleton className="w-7 h-7 rounded" />
                  </div>
                  <div className={`w-10 h-10 rounded-xl ${style.accentBg} flex items-center justify-center`}>
                    <Skeleton className="w-5 h-5 rounded" />
                  </div>
                </div>
                <div>
                  <Skeleton className="h-8 w-24 mb-1" />
                  <Skeleton className="h-4 w-32 mb-3" />
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-2 h-2 rounded-full animate-pulse" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Premium Analytics Dashboard Skeleton */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-6 w-48" />
                </div>
                <Skeleton className="h-4 w-64 mt-1" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Tabs Skeleton */}
            <div className="px-6 pt-4">
              <div className="grid w-full grid-cols-3 bg-muted/50 rounded-lg p-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-center gap-2 py-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </div>

            {/* Tab Content Skeleton */}
            <div className="p-6 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { gradient: 'from-blue-500/10 to-blue-500/5', border: 'border-blue-500/20' },
                  { gradient: 'from-green-500/10 to-green-500/5', border: 'border-green-500/20' },
                  { gradient: 'from-orange-500/10 to-orange-500/5', border: 'border-orange-500/20' },
                  { gradient: 'from-purple-500/10 to-purple-500/5', border: 'border-purple-500/20' }
                ].map((style, i) => (
                  <div key={i} className={`p-4 rounded-xl bg-gradient-to-br ${style.gradient} border ${style.border}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Skeleton className="w-8 h-8 rounded-lg" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-7 w-16" />
                  </div>
                ))}
              </div>

              {/* Progress Bar Skeleton */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
                <div className="flex items-center justify-between mt-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>

              {/* Graph Controls Skeleton */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>

              {/* Charts Skeleton */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-card border border-border/50">
                  <Skeleton className="h-4 w-48 mb-3" />
                  <div className="h-[220px] flex items-center justify-center">
                    {/* Pie Chart Skeleton */}
                    <div className="relative">
                      <Skeleton className="h-40 w-40 rounded-full" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-20 w-20 rounded-full bg-background" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border/50">
                  <Skeleton className="h-4 w-40 mb-3" />
                  <div className="h-[220px] space-y-3 flex flex-col justify-end">
                    {/* Bar Chart Skeleton */}
                    {[70, 90, 50, 85, 60].map((height, i) => (
                      <div key={i} className="flex items-end gap-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-4 flex-1" style={{ height: `${height}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Apartment/Portfolio List Items Skeleton */}
              <div>
                <Skeleton className="h-5 w-32 mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-5 rounded-xl bg-gradient-to-br from-card to-muted/20 border border-border/50 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                            <Skeleton className="w-6 h-6 rounded" />
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-5 w-40" />
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-3 w-3 rounded" />
                              <Skeleton className="h-3 w-56" />
                            </div>
                          </div>
                        </div>
                        <Skeleton className="h-6 w-28 rounded-full" />
                      </div>
                      <div className="grid grid-cols-4 gap-2 pt-3 border-t border-border/30">
                        {[1, 2, 3, 4].map((j) => (
                          <div key={j} className="p-2 rounded-lg bg-gradient-to-br from-muted/60 to-muted/30">
                            <Skeleton className="h-2 w-16 mb-1" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default ClientViewSkeleton;
