'use client';

import React, { ReactNode } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import SidebarLayout without SSR
const SidebarLayout = dynamic(
  () => import('@/components/layout/SidebarLayout'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen">
        <div className="w-64 bg-gray-900 dark:bg-slate-900"></div>
        <main className="flex-1 flex flex-col min-h-screen bg-gray-100 dark:bg-slate-900">
          <div className="h-16 bg-white dark:bg-slate-800 border-b"></div>
          <div className="flex-1 bg-gray-200 dark:bg-slate-800 p-4 md:p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
              <div className="h-32 bg-gray-300 rounded"></div>
            </div>
          </div>
        </main>
      </div>
    ),
  },
);

export default function MainLayout({ children }: { children: ReactNode }) {
  return <SidebarLayout>{children}</SidebarLayout>;
} 