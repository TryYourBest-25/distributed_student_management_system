'use client';

import React from 'react';
import UserNav from './UserNav';
import Link from 'next/link';
import { TenantSelector } from '@/components/tenant-selector';
import { useTenantContext } from '@/contexts/tenant-context';

const Header = () => {
  const { setSelectedTenant } = useTenantContext();

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-800 shadow-sm p-4 border-b border-gray-200 dark:border-slate-700">
      <div className="mx-auto px-0 sm:px-2 lg:px-4">
        <div className="flex items-center justify-between h-12 sm:h-16">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-200"
            >
              Hệ thống Học vụ
            </Link>
            <TenantSelector 
              onTenantChange={setSelectedTenant}
              className="hidden sm:flex"
            />
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <UserNav />
          </div>
        </div>
        {/* Mobile tenant selector */}
        <div className="sm:hidden mt-2 pt-2 border-t border-gray-200 dark:border-slate-700">
          <TenantSelector onTenantChange={setSelectedTenant} />
        </div>
      </div>
    </header>
  );
};

export default Header; 