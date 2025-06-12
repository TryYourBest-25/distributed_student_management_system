'use client';

import { AlertTriangle } from 'lucide-react';

interface TenantNotSelectedProps {
  message?: string;
}

export function TenantNotSelected({ 
  message = "Vui lòng chọn khoa để xem dữ liệu tương ứng." 
}: TenantNotSelectedProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="max-w-md p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
              Chưa chọn khoa
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300 mt-1">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 