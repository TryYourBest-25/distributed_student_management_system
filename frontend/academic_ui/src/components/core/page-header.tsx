'use client';

import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actionButton?: React.ReactNode; // Cho nút "Thêm mới" hoặc hành động khác
}

const PageHeader = ({ title, description, actionButton }: PageHeaderProps) => {
  return (
    <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      {actionButton && <div className="mt-4 sm:mt-0">{actionButton}</div>}
    </div>
  );
};

export default PageHeader; 