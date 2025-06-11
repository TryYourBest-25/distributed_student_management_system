"use client";

import React, { useMemo } from "react";
import { useSession } from "next-auth/react";
import { UserRole } from "@/types/auth";
import PageHeader from "@/components/core/page-header";
import { ClassDataTable } from "@/components/features/classes/class-data-table";
import { columns as classColumnsFunction } from "@/components/features/classes/class-columns";
import { useClasses, useCreateClass, useDeleteClass } from "@/hooks/use-classes";
import { Class, classFormToApiRequest } from "@/types/class";
import { ClassFormValues } from "@/lib/validators/class-validator";
import { useTenantContext } from "@/contexts/tenant-context";
import { TenantNotSelected } from "@/components/tenant-not-selected";

const MOCK_FACULTIES_PAGE_DATA = [
  { value: "CNTT", label: "Khoa Công nghệ Thông tin" },
  { value: "DTVT", label: "Khoa Điện tử Viễn thông" },
  { value: "CK", label: "Khoa Cơ khí" },
];

export default function ClassesPage() {
  const { data: session } = useSession();
  const { selectedTenant, getFacultyCode, getFacultyServicePath } = useTenantContext();

  // Lấy faculty code và service path từ tenant được chọn
  const userRoles = session?.user?.roles || [];
  const facultyCode = getFacultyCode();
  const servicePath = getFacultyServicePath();

  // Fetch classes data from API
  const { data: classes = [], isLoading, error } = useClasses(facultyCode, servicePath);
  
  // Create and delete class mutations
  const createClassMutation = useCreateClass(facultyCode, servicePath);
  const deleteClassMutation = useDeleteClass(facultyCode, servicePath);

  const canManage = useMemo(() => {
    return userRoles.includes('PGV') || userRoles.includes('KHOA');
  }, [userRoles]);

  // Memoize the actual columns array by calling the function
  const actualClassColumns = useMemo(() => classColumnsFunction(), []);

  const pageTitle = useMemo(() => {
    if (selectedTenant) {
      return `Lớp học ${selectedTenant.name}`;
    }
    const facultyInfo = MOCK_FACULTIES_PAGE_DATA.find(f => f.value === facultyCode);
    return facultyInfo ? `Lớp học ${facultyInfo.label}` : `Lớp học Khoa ${facultyCode}`;
  }, [selectedTenant, facultyCode]);



  const handleSaveClass = async (values: ClassFormValues) => {
    try {
      const apiData = classFormToApiRequest(values);
      await createClassMutation.mutateAsync(apiData);
    } catch (error) {
      console.error('Error creating class:', error);
    }
  };

  const handleDeleteClass = async (classInfo: Class) => {
    try {
      await deleteClassMutation.mutateAsync(classInfo.class_code);
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  };

  // Hiển thị thông báo nếu chưa chọn tenant
  if (!selectedTenant) {
    return (
      <div className="space-y-6 py-4 sm:py-6 md:py-8">
        <PageHeader title="Lớp học" />
        <TenantNotSelected message="Vui lòng chọn khoa để xem danh sách lớp học." />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 py-4 sm:py-6 md:py-8">
        <PageHeader title={pageTitle} />
        <div className="flex justify-center items-center h-64">
          <p>Đang tải danh sách lớp học...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 py-4 sm:py-6 md:py-8">
        <PageHeader title={pageTitle} />
        <div className="flex justify-center items-center h-64">
          <p className="text-red-600">Lỗi khi tải danh sách lớp học: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4 sm:py-6 md:py-8">
      <PageHeader
        title={pageTitle}
        description={`Hiển thị ${classes.length} lớp học từ API khoa ${selectedTenant?.name || facultyCode}`}
      />
      <ClassDataTable
        columns={actualClassColumns}
        data={classes}
        canManage={canManage}
        facultyCode={facultyCode}
        availableFaculties={MOCK_FACULTIES_PAGE_DATA}
        onSaveClass={handleSaveClass}
        onDeleteClass={handleDeleteClass}
      />
    </div>
  );
} 