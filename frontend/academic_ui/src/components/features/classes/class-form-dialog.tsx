"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClassForm } from './class-form';
import { ClassFormValues } from '@/lib/validators/class-validator';

export interface ClassFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ClassFormValues) => Promise<void>;
  defaultValues?: Partial<ClassFormValues>;
  isLoading?: boolean;
}

export function ClassFormDialog({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  isLoading,
}: ClassFormDialogProps) {
  const isEditing = !!defaultValues?.class_code;
  
  const handleSubmit = async (values: ClassFormValues) => {
    await onSubmit(values);
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Chỉnh sửa lớp học" : "Thêm lớp học mới"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Chỉnh sửa thông tin lớp học. Nhấn lưu để áp dụng thay đổi."
              : "Thêm thông tin lớp học mới. Nhấn lưu để tạo lớp học."
            }
          </DialogDescription>
        </DialogHeader>
        <ClassForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          defaultValues={defaultValues}
          isLoading={isLoading}
          allowEditClassCode={!isEditing}
        />
      </DialogContent>
    </Dialog>
  );
} 