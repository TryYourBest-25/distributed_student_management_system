import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function ClassDetailSkeleton() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Button variant="outline" size="sm" disabled>
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
        </Button>
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <span className="hover:text-gray-700">Lớp học</span>
            </li>
            <li className="text-gray-400">/</li>
            <li className="h-4 w-16 bg-gray-300 rounded animate-pulse"></li>
          </ol>
        </nav>
      </div>
      
      <div className="space-y-4 mb-6">
        <div className="h-8 w-96 bg-gray-300 rounded animate-pulse"></div>
        <div className="h-6 w-64 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 sm:p-6">
          <div className="h-6 w-32 bg-gray-300 rounded animate-pulse mb-4"></div>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-5 w-32 bg-gray-300 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="h-6 w-40 bg-gray-300 rounded animate-pulse mb-4"></div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-24 bg-gray-200 rounded animate-pulse ml-auto"></div>
            </div>
            <div className="border rounded-lg p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-3 border-b last:border-b-0">
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-8 bg-gray-200 rounded animate-pulse ml-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 