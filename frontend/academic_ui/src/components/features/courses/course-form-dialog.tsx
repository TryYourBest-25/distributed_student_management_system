'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose, // Option to add a close button in footer if not using onCancel prop
} from "@/components/ui/dialog";
import { CourseForm, CourseFormValues } from './course-form';
import { Course } from '@/app/(main)/courses/page';

interface CourseFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CourseFormValues, existingCourseId?: string) => void; // existingCourseId for edit
  existingCourse?: Course | null; // Dữ liệu môn học hiện tại (nếu là edit)
  isLoading?: boolean;
}

export const CourseFormDialog: React.FC<CourseFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingCourse,
  isLoading,
}) => {
  const handleSubmit = (values: CourseFormValues) => {
    onSubmit(values, existingCourse?.id);
  };

  // Chuẩn bị defaultValues cho CourseForm từ existingCourse
  const defaultFormValues: Partial<CourseFormValues> | undefined = existingCourse
    ? {
        course_code: existingCourse.course_code,
        course_name: existingCourse.course_name,
        lecture_credit: existingCourse.lecture_credit,
        lab_credit: existingCourse.lab_credit,
      }
    : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {existingCourse ? 'Chỉnh sửa Môn học' : 'Thêm Môn học mới'}
          </DialogTitle>
          {existingCourse && (
            <DialogDescription>
              Cập nhật thông tin cho môn học: {existingCourse.course_name} ({existingCourse.course_code})
            </DialogDescription>
          )}
          {!existingCourse && (
             <DialogDescription>
              Điền thông tin chi tiết để tạo một môn học mới.
            </DialogDescription>
          )}
        </DialogHeader>
        
        <CourseForm 
          onSubmit={handleSubmit} 
          onCancel={onClose} 
          defaultValues={defaultFormValues} 
          isLoading={isLoading} 
        />

        {/* 
          DialogFooter có thể không cần thiết nếu CourseForm đã có nút Hủy và Submit 
          và việc đóng dialog được xử lý qua onCancel và sau khi onSubmit thành công.
        */}
        {/* <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Hủy</Button>
          </DialogClose>
          // Nút submit chính sẽ nằm trong CourseForm
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}; 