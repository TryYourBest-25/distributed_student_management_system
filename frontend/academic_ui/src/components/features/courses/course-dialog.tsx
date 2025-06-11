'use client';

import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CourseForm, CourseFormValues } from './course-form';
import { Course, courseToApiRequest } from '@/types/course';
import { useCreateCourse, useUpdateCourse } from '@/hooks/use-courses';

interface CourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course; // Undefined cho thêm mới, có giá trị cho sửa
  mode: 'create' | 'edit';
}

export function CourseDialog({ open, onOpenChange, course, mode }: CourseDialogProps) {
  const createCourseMutation = useCreateCourse();
  const updateCourseMutation = useUpdateCourse();

  const isLoading = createCourseMutation.isPending || updateCourseMutation.isPending;

  // Reset mutation state khi dialog đóng
  useEffect(() => {
    if (!open) {
      createCourseMutation.reset();
      updateCourseMutation.reset();
    }
  }, [open, createCourseMutation, updateCourseMutation]);

  const handleSubmit = async (values: CourseFormValues) => {
    try {
      if (mode === 'create') {
        await createCourseMutation.mutateAsync(courseToApiRequest({
          course_code: values.course_code,
          course_name: values.course_name,
          lecture_credit: values.lecture_credit,
          lab_credit: values.lab_credit,
        }));
      } else if (course) {
        await updateCourseMutation.mutateAsync({
          courseCode: course.course_code,
          data: courseToApiRequest({
            course_code: values.course_code,
            course_name: values.course_name,
            lecture_credit: values.lecture_credit,
            lab_credit: values.lab_credit,
          }),
        });
      }
      onOpenChange(false);
    } catch (error) {
      // Error đã được handle trong hook
      console.error('Course operation failed:', error);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const defaultValues = course ? {
    course_code: course.course_code,
    course_name: course.course_name,
    lecture_credit: course.lecture_credit,
    lab_credit: course.lab_credit,
  } : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Thêm Môn Học Mới' : 'Sửa Môn Học'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Điền thông tin để tạo môn học mới trong hệ thống.'
              : 'Cập nhật thông tin môn học.'
            }
          </DialogDescription>
        </DialogHeader>
        <CourseForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          defaultValues={defaultValues}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
} 