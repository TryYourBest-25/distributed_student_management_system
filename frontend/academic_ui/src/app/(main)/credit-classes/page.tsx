"use client";

import React, { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/types/auth';
import PageHeader from '@/components/core/page-header';
import { Button } from '@/components/ui/button';
import { CreditClassDataTable, CreditClassInfo } from '@/components/features/credit-classes/credit-class-data-table';
import { columns as creditClassColumnsDefinition } from '@/components/features/credit-classes/credit-class-columns';
import { useCreditClasses } from '@/hooks/use-credit-classes';
import { type CreditClassBasicResponse } from '@/services/credit-class-service';
import { RefreshCw } from 'lucide-react';

const transformCreditClassData = (creditClass: CreditClassBasicResponse): CreditClassInfo => {
  return {
    creditClassId: creditClass.creditClassId,
    credit_class_code: `${creditClass.courseCode}.${creditClass.groupNumber}`,
    course_code: creditClass.courseCode,
    group_number: creditClass.groupNumber,
    current_students: creditClass.currentStudent,
    min_students: creditClass.minStudent,
    academic_year: creditClass.academicYear,
    semester: creditClass.semester,
    is_cancelled: creditClass.isCancelled,
  };
};

export default function CreditClassesPage() {
  const { data: session, status } = useSession();

  // Per user request, temporarily hardcode faculty to 'it-faculty'
  const facultyCode = 'it-faculty';

  const { data: creditClassesResponse, isLoading, error, refetch } = useCreditClasses(facultyCode, {
    page: 0,
    pageSize: 50,
  });

  const { creditClasses, pageTitle, canManage } = useMemo(() => {
    const classes = creditClassesResponse?.items.map(transformCreditClassData) || [];
    const userRoles = session?.user?.roles || [];
    
    const isPgv = userRoles.includes(UserRole.PGV);
    const isKhoa = userRoles.includes(UserRole.KHOA);

    let currentTitle = 'Danh sách Lớp tín chỉ';
    if (isPgv) {
        currentTitle = `Lớp tín chỉ - Khoa Công nghệ thông tin`;
    } else if (isKhoa) {
        currentTitle = `Lớp tín chỉ Khoa Công nghệ thông tin`;
    }
    
    const managePermission = isPgv || isKhoa;

    return {
      creditClasses: classes,
      pageTitle: currentTitle,
      canManage: managePermission,
    };
  }, [creditClassesResponse, session]);

  const handleRefresh = () => {
    refetch();
  };
  
  const columns = creditClassColumnsDefinition;

  if (status === 'loading' || isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Đang tải..." />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Đang tải danh sách lớp tín chỉ...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Lỗi" />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 max-w-md">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Không thể tải danh sách lớp tín chỉ
              </h3>
              <p className="text-red-600 dark:text-red-300 mb-4">
                {error.message}
              </p>
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Thử lại
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={pageTitle}
        actionButton={
          <Button variant="outline" onClick={handleRefresh} size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
        }
      />
      <CreditClassDataTable
        columns={columns}
        data={creditClasses}
        canManage={canManage}
        facultyCode={facultyCode}
      />
    </div>
  );
} 