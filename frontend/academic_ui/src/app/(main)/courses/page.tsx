'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/types/auth';
import { columns as courseColumnsDefinition } from '@/components/features/courses/course-columns';
import { CourseDataTable } from '@/components/features/courses/course-data-table';
import PageHeader from '@/components/core/page-header';
import { Course } from '@/types/course';
import { useCourses, useDeleteCourse } from '@/hooks/use-courses';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';

export default function CoursesPage() {
  const { data: session, status } = useSession();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  
  // React Query hooks
  const { data: courses = [], isLoading: coursesLoading, error } = useCourses();
  const deleteCourseMutation = useDeleteCourse();

  const isPgv = session?.user?.roles?.includes(UserRole.PGV) ?? false;
  const pageTitle = isPgv ? 'Quản lý Môn học' : 'Danh sách Môn học';
  const canManage = isPgv;

  const handleDeleteCourse = (course: Course) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (courseToDelete) {
      try {
        await deleteCourseMutation.mutateAsync(courseToDelete.course_code);
        setDeleteDialogOpen(false);
        setCourseToDelete(null);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };
  
  const isLoading = status === 'loading' || coursesLoading;

  if (isLoading) {
      return (
          <div className="space-y-6">
              <PageHeader title="Đang tải danh sách môn học..."/>
              <div className="space-y-2">
                  <Skeleton className="h-12 w-full"/>
                  <Skeleton className="h-12 w-full"/>
                  <Skeleton className="h-12 w-full"/>
              </div>
          </div>
      )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title={pageTitle} />
        <div className="text-center py-8">
          <p className="text-red-600">Lỗi khi tải dữ liệu môn học: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={pageTitle} />
      <CourseDataTable
        columns={courseColumnsDefinition({ canManage })}
        data={courses}
        isLoading={isLoading}
        canManage={canManage}
        onDeleteCourse={handleDeleteCourse}
      />
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa môn học</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa môn học "{courseToDelete?.course_name}" (Mã: {courseToDelete?.course_code})?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setCourseToDelete(null);
            }}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={deleteCourseMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteCourseMutation.isPending ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 