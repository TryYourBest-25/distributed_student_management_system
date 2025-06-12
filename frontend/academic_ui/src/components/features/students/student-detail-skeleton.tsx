"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function StudentDetailSkeleton() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      {/* Navigation skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Skeleton className="h-9 w-32" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Page header skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-80 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Student info card skeleton */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 sm:p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Registrations section skeleton */}
        <div className="lg:col-span-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <Skeleton className="h-6 w-48 mb-2 sm:mb-0" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          {/* Table skeleton */}
          <div className="border rounded-lg">
            {/* Table header */}
            <div className="border-b bg-gray-50 dark:bg-gray-800/50 p-4">
              <div className="grid grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </div>
            
            {/* Table rows */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border-b last:border-b-0 p-4">
                <div className="grid grid-cols-6 gap-4">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 