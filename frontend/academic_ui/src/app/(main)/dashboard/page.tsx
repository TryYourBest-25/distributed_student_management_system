'use client';

import PageHeader from "@/components/core/page-header";
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from 'next-auth/react';

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="container mx-auto py-10">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-96" />
        </div>
      </div>
    );
  }

  const userName = session?.user?.name || 'người dùng';

  return (
    <div className="container mx-auto py-10">
      <PageHeader title="Bảng điều khiển" description={`Chào mừng trở lại, ${userName}!`} />
      <div className="mt-6">
        <p className="text-lg">
          Đây là trang tổng quan chính của hệ thống quản lý học vụ.
        </p>
        <p className="mt-2 text-muted-foreground">
          Các chức năng chính có thể được truy cập từ thanh điều hướng bên trái.
        </p>
        {/* We can add more role-specific information or quick links here later */}
      </div>
    </div>
  );
} 