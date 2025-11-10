import { Loader, MapPin } from "lucide-react";

// Spinning Loader
export const SpinningLoader = ({ text = "Loading..." }: { text?: string }) => (
  <div className="flex flex-col items-center justify-center p-8">
    <Loader className="h-8 w-8 animate-spin text-primary" />
    <p className="mt-2 text-sm text-muted-foreground">{text}</p>
  </div>
);

// Map Loading Placeholder
export const MapLoadingPlaceholder = () => (
  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center animate-pulse">
    <div className="text-center">
      <MapPin className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
      <p className="text-gray-600 dark:text-gray-400 font-medium">Loading map...</p>
    </div>
  </div>
);

// Issue List Skeleton Loader
export const IssueListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, idx) => (
      <div
        key={idx}
        className="p-4 rounded-lg bg-gradient-to-r from-gray-100 to-gray-50 dark:from-slate-800 dark:to-slate-900 animate-pulse"
      >
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="h-5 bg-gray-300 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-slate-700 rounded w-2/3"></div>
          </div>
          <div className="h-6 bg-gray-300 dark:bg-slate-700 rounded w-20"></div>
        </div>
      </div>
    ))}
  </div>
);

// Statistics Card Skeleton
export const StatSkeleton = ({ count = 9 }: { count?: number }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
    {Array.from({ length: count }).map((_, idx) => (
      <div
        key={idx}
        className="bg-gradient-to-br from-gray-100 to-gray-50 dark:from-slate-800 dark:to-slate-900 p-4 rounded-lg animate-pulse"
      >
        <div className="h-4 bg-gray-300 dark:bg-slate-700 rounded w-2/3 mb-3"></div>
        <div className="h-8 bg-gray-300 dark:bg-slate-700 rounded w-1/2"></div>
      </div>
    ))}
  </div>
);

// Two-column layout skeleton (list + map)
export const DashboardSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[800px]">
    {/* Left column - list skeleton */}
    <div className="lg:col-span-1 flex flex-col bg-white dark:bg-slate-900 rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="h-10 bg-gray-200 dark:bg-slate-800 rounded mb-3 animate-pulse"></div>
        <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded animate-pulse"></div>
      </div>
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        <IssueListSkeleton count={6} />
      </div>
    </div>

    {/* Right column - map skeleton */}
    <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-lg shadow-lg overflow-hidden">
      <MapLoadingPlaceholder />
    </div>
  </div>
);

// Filter Panel Skeleton
export const FilterSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, idx) => (
      <div key={idx} className="animate-pulse">
        <div className="h-4 bg-gray-300 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
        <div className="h-10 bg-gray-300 dark:bg-slate-700 rounded"></div>
      </div>
    ))}
  </div>
);

// Page Skeleton (for full page load)
export const PageSkeleton = () => (
  <div className="min-h-screen bg-background p-4">
    {/* Header skeleton */}
    <div className="h-16 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-slate-800 dark:to-slate-900 rounded-lg mb-8 animate-pulse"></div>

    {/* Stats skeleton */}
    <div className="mb-8">
      <div className="h-6 bg-gray-300 dark:bg-slate-700 rounded w-1/4 mb-4 animate-pulse"></div>
      <StatSkeleton count={9} />
    </div>

    {/* Dashboard skeleton */}
    <DashboardSkeleton />
  </div>
);

// Issue Card Skeleton
export const IssueCardSkeleton = () => (
  <div className="p-4 rounded-lg bg-gradient-to-r from-gray-100 to-gray-50 dark:from-slate-800 dark:to-slate-900 animate-pulse">
    <div className="flex justify-between items-start gap-4">
      <div className="flex-1">
        <div className="h-5 bg-gray-300 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-slate-700 rounded w-2/3"></div>
      </div>
      <div className="h-6 bg-gray-300 dark:bg-slate-700 rounded w-20"></div>
    </div>
  </div>
);
