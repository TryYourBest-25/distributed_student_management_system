'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/providers/AuthProvider';
import { UserRole } from '@/types/auth';
import { useLecturer, useUpdateLecturer } from '@/hooks/use-lecturers';
import { LecturerForm } from '@/components/features/lecturers/lecturer-form';
import { LecturerFormValues } from '@/lib/validators/lecturer-validator';
import { lecturerToApiRequest, Lecturer } from '@/types/lecturer';
import Link from 'next/link';
import PageHeader from '@/components/core/page-header';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Mock faculties data
const mockFaculties = [
  { faculty_code: 'CNTT', faculty_name: 'Khoa Công nghệ Thông tin' },
  { faculty_code: 'DTVT', faculty_name: 'Khoa Điện tử Viễn thông' },
  { faculty_code: 'CK', faculty_name: 'Khoa Cơ khí' },
];





export default function LecturerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const lecturerCode = params.lecturer_code as string;

  const { data: lecturer, isLoading, error } = useLecturer(lecturerCode);
  const updateLecturerMutation = useUpdateLecturer({
    onSuccess: () => {
      router.push('/lecturers');
    }
  });

  const canEdit = user?.role === UserRole.PGV;

  const handleSubmit = async (values: LecturerFormValues) => {
    if (!lecturer) return;

    try {
      await updateLecturerMutation.mutateAsync({
        lecturerCode: lecturer.lecturer_code,
        data: lecturerToApiRequest({
          lecturer_code: values.lecturer_code,
          first_name: values.first_name,
          last_name: values.last_name,
          degree: values.degree || undefined,
          academic_rank: values.academic_rank || undefined,
          specialization: values.specialization || undefined,
          faculty_code: values.faculty_code,
        }),
      });
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleCancel = () => {
    router.push('/lecturers');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.push('/lecturers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground">Đang tải thông tin giảng viên...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !lecturer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.push('/lecturers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600">
            {error?.message || `Không tìm thấy giảng viên với mã ${lecturerCode}`}
          </p>
        </div>
      </div>
    );
  }

  const pageTitle = canEdit ? 'Chỉnh sửa Giảng viên' : 'Chi tiết Giảng viên';

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/lecturers">Giảng viên</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{lecturer.lecturer_code}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <PageHeader title={`${pageTitle}: ${lecturer.full_name}`} />
          <Button variant="ghost" onClick={() => router.push('/lecturers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>

        {/* Form */}
        <div className="w-full">
          <div className="w-full">
            <div className="rounded-lg border bg-card shadow-sm p-8">
              <div className="space-y-4 mb-8">
                <h3 className="text-xl font-semibold">Thông tin giảng viên</h3>
                <p className="text-sm text-muted-foreground">
                  {canEdit 
                    ? 'Cập nhật thông tin giảng viên dưới đây, bao gồm cả mã giảng viên nếu cần.'
                    : 'Xem thông tin chi tiết của giảng viên.'
                  }
                </p>
              </div>
            
              {canEdit ? (
                <LecturerForm
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  defaultValues={{
                    lecturer_code: lecturer.lecturer_code,
                    first_name: lecturer.first_name,
                    last_name: lecturer.last_name,
                    degree: lecturer.degree || '',
                    academic_rank: lecturer.academic_rank || '',
                    specialization: lecturer.specialization || '',
                    faculty_code: lecturer.faculty_code,
                  }}
                  isLoading={updateLecturerMutation.isPending}
                  availableFaculties={mockFaculties}
                  allowEditLecturerCode={true}
                />
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Mã Giảng viên</label>
                      <div className="mt-2 p-4 border rounded-lg bg-muted text-base">
                        {lecturer.lecturer_code}
                      </div>
                    </div>
                    <div className="md:col-span-2 xl:col-span-3">
                      <label className="text-sm font-medium text-gray-700">Họ và Tên</label>
                      <div className="mt-2 p-4 border rounded-lg bg-muted text-base">
                        {lecturer.full_name}
                      </div>
                    </div>
                    {lecturer.degree && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Học vị</label>
                        <div className="mt-2 p-4 border rounded-lg bg-muted text-base">
                          {lecturer.degree}
                        </div>
                      </div>
                    )}
                    {lecturer.academic_rank && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Học hàm</label>
                        <div className="mt-2 p-4 border rounded-lg bg-muted text-base">
                          {lecturer.academic_rank}
                        </div>
                      </div>
                    )}
                                          {lecturer.specialization && (
                        <div className="md:col-span-2 xl:col-span-3">
                          <label className="text-sm font-medium text-gray-700">Chuyên môn</label>
                        <div className="mt-2 p-4 border rounded-lg bg-muted text-base">
                          {lecturer.specialization}
                        </div>
                      </div>
                    )}
                                          {lecturer.faculty_name && (
                        <div className="md:col-span-2 xl:col-span-3">
                          <label className="text-sm font-medium text-gray-700">Khoa</label>
                        <div className="mt-2 p-4 border rounded-lg bg-muted text-base">
                          {lecturer.faculty_name} ({lecturer.faculty_code})
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end pt-6">
                    <Button onClick={handleCancel} size="lg">
                      Quay lại
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 