"use client";

import React, { useMemo } from "react";
import { useAuth } from "@/lib/providers/AuthProvider";
import { UserRole } from "@/types/auth";
import PageHeader from "@/components/core/page-header";
import { ClassDataTable } from "@/components/features/classes/class-data-table";
import { columns as classColumnsFunction } from "@/components/features/classes/class-columns";
import { useClasses, useCreateClass, useDeleteClass } from "@/hooks/use-classes";
import { Class, classFormToApiRequest } from "@/types/class";
import { ClassFormValues } from "@/lib/validators/class-validator";

const MOCK_FACULTIES_PAGE_DATA = [
  { value: "CNTT", label: "Khoa Công nghệ Thông tin" },
  { value: "DTVT", label: "Khoa Điện tử Viễn thông" },
  { value: "CK", label: "Khoa Cơ khí" },
];

export default function ClassesPage() {
  const { user } = useAuth();

  // Determine faculty code - hiện tại chỉ test với it-faculty
  const facultyCode = user?.role === UserRole.KHOA 
    ? user.faculty_code || 'it-faculty'
    : 'it-faculty'; // PGV cũng chỉ xem it-faculty trong giai đoạn test

  // Fetch classes data from API
  const { data: classes = [], isLoading, error } = useClasses(facultyCode);
  
  // Create and delete class mutations
  const createClassMutation = useCreateClass(facultyCode);
  const deleteClassMutation = useDeleteClass(facultyCode);

  const canManage = useMemo(() => {
    return user?.role === UserRole.PGV || user?.role === UserRole.KHOA;
  }, [user?.role]);

  // Memoize the actual columns array by calling the function
  const actualClassColumns = useMemo(() => classColumnsFunction(), []);

  const pageTitle = useMemo(() => {
    const facultyInfo = MOCK_FACULTIES_PAGE_DATA.find(f => f.value === facultyCode);
    return facultyInfo ? `Lớp học ${facultyInfo.label}` : `Lớp học Khoa ${facultyCode}`;
  }, [facultyCode]);



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
        description={`Hiển thị ${classes.length} lớp học từ API khoa ${facultyCode}`}
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