'use client';

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { LecturerForm } from './lecturer-form';
import { LecturerFormValues } from '@/lib/validators/lecturer-validator';
import { Lecturer } from '@/types/lecturer';
import { Faculty } from "@/types/faculty";

export interface LecturerFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: LecturerFormValues, existingLecturerCode?: string) => Promise<void>;
  defaultValues?: Partial<Lecturer>;
  isLoading?: boolean;
  availableFaculties: Faculty[];
}

export function LecturerFormDialog({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  isLoading,
  availableFaculties,
}: LecturerFormDialogProps) {
  const dialogTitle = defaultValues?.lecturer_code ? "Chỉnh sửa Giảng viên" : "Thêm Giảng viên mới";
  const dialogDescription = defaultValues?.lecturer_code
    ? "Cập nhật thông tin giảng viên. Nhấn Lưu để hoàn tất."
    : "Thêm một giảng viên mới vào hệ thống. Điền đầy đủ thông tin bên dưới.";

  const handleSubmit = async (values: LecturerFormValues) => {
    await onSubmit(values, defaultValues?.lecturer_code);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <LecturerForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          defaultValues={defaultValues}
          isLoading={isLoading}
          availableFaculties={availableFaculties}
          allowEditLecturerCode={!defaultValues?.lecturer_code}
        />
      </DialogContent>
    </Dialog>
  );
} 