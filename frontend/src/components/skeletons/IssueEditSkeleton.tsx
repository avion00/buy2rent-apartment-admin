import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageLayout } from '@/components/layout/PageLayout';

export function BreadcrumbSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="h-4 w-12" />
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <Skeleton className="h-9 w-32 rounded-md" />
    </div>
  );
}

export function IssueInformationSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-6 w-40" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Row 1: Issue Type & Status */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-24 w-full rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

export function PriorityImpactSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-6 w-40" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Row 1: Priority & Impact */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>

        {/* Row 2: Expected Resolution */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ResolutionDetailsSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-6 w-36" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Row 1: Resolution Type & Replacement ETA */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>

        {/* Resolution Notes */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-20 w-full rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

export function AdditionalDetailsSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-6 w-36" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Row 1: Delivery Date, Invoice, Tracking */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function IssueEditSkeleton() {
  return (
    <PageLayout title="Edit Issue">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <BreadcrumbSkeleton />

        {/* Header */}
        <HeaderSkeleton />

        {/* Issue Information */}
        <IssueInformationSkeleton />

        {/* Priority & Impact */}
        <PriorityImpactSkeleton />

        {/* Resolution Details */}
        <ResolutionDetailsSkeleton />

        {/* Additional Details */}
        <AdditionalDetailsSkeleton />

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>
    </PageLayout>
  );
}

export default IssueEditSkeleton;
