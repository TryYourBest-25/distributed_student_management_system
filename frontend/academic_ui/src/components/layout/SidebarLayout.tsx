'use client';

import React, { ReactNode } from 'react';
import Header from '@/components/layout/Header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

interface SidebarLayoutProps {
  children: ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 flex flex-col min-h-screen bg-gray-100 dark:bg-slate-900">
        <Header />
        <div className="flex-1 bg-gray-200 dark:bg-slate-800 p-4 md:p-6">
          <SidebarTrigger className="md:hidden p-1 -ml-1 mb-2 rounded-md hover:bg-gray-300 dark:hover:bg-slate-700" />
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
} 