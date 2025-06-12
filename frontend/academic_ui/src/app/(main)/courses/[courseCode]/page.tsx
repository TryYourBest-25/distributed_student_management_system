'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/types/auth';
import { useCourse, useUpdateCourse } from '@/hooks/use-courses';
import { CourseForm, CourseFormValues } from '@/components/features/courses/course-form';
import { courseToApiRequest } from '@/types/course';
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

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const courseCode = params.courseCode as string;

  const { data: course, isLoading: courseLoading, error } = useCourse(courseCode);
  const updateCourseMutation = useUpdateCourse({
    onSuccess: () => {
      router.push('/courses');
    }
  });

  const canEdit = session?.user?.roles?.includes(UserRole.PGV) ?? false;
  const isLoading = sessionStatus === 'loading' || courseLoading;

  const handleSubmit = async (values: CourseFormValues) => {
    if (!course) return;

    try {
      await updateCourseMutation.mutateAsync({
        courseCode: course.course_code,
        data: courseToApiRequest({
          course_code: values.course_code,
          course_name: values.course_name,
          lecture_credit: values.lecture_credit,
          lab_credit: values.lab_credit,
        }),
      });
      // Navigation sẽ được handle trong onSuccess callback
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleCancel = () => {
    router.push('/courses');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.push('/courses')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground">Đang tải thông tin môn học...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.push('/courses')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600">
            {error?.message || `Không tìm thấy môn học với mã ${courseCode}`}
          </p>
        </div>
      </div>
    );
  }

  const pageTitle = canEdit ? 'Chỉnh sửa Môn học' : 'Chi tiết Môn học';

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/courses">Môn học</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{course.course_code}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <PageHeader title={`${pageTitle}: ${course.course_name}`} />
          <Button variant="ghost" onClick={() => router.push('/courses')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>

      {/* Form */}
      <div className="w-full">
        <div className="w-full">
          <div className="rounded-lg border bg-card shadow-sm p-8">
            <div className="space-y-4 mb-8">
              <h3 className="text-xl font-semibold">Thông tin môn học</h3>
              <p className="text-sm text-muted-foreground">
                {canEdit 
                  ? 'Cập nhật thông tin môn học dưới đây, bao gồm cả mã môn học nếu cần.'
                  : 'Xem thông tin chi tiết của môn học.'
                }
              </p>
            </div>
          
          {canEdit ? (
            <CourseForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              defaultValues={{
                course_code: course.course_code,
                course_name: course.course_name,
                lecture_credit: course.lecture_credit,
                lab_credit: course.lab_credit,
              }}
              isLoading={updateCourseMutation.isPending}
              allowEditCourseCode={true}
            />
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">Mã Môn Học</label>
                  <div className="mt-2 p-4 border rounded-lg bg-muted text-base">
                    {course.course_code}
                  </div>
                </div>
                <div className="md:col-span-2 xl:col-span-4">
                  <label className="text-sm font-medium text-gray-700">Tên Môn Học</label>
                  <div className="mt-2 p-4 border rounded-lg bg-muted text-base">
                    {course.course_name}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Số Tín Chỉ Lý Thuyết</label>
                  <div className="mt-2 p-4 border rounded-lg bg-muted text-base">
                    {course.lecture_credit}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Số Tín Chỉ Thực Hành</label>
                  <div className="mt-2 p-4 border rounded-lg bg-muted text-base">
                    {course.lab_credit}
                  </div>
                </div>
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