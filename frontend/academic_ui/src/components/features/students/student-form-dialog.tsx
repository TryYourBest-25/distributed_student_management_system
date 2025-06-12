"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StudentForm, StudentFormValues } from "./student-form";
import { Student } from "./student-data-table";

interface StudentFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (values: StudentFormValues, studentId?: string) => void; // studentId is for editing
  onCancel: () => void;
  defaultValues?: Partial<Student>;
  isLoading?: boolean;
  classCode: string; // To provide context, e.g., "Adding student to D20CNTT01"
}

export function StudentFormDialog({
  isOpen,
  onOpenChange,
  onSave,
  onCancel,
  defaultValues,
  isLoading,
  classCode,
}: StudentFormDialogProps) {
  const dialogTitle = defaultValues?.id ? `Chỉnh sửa Sinh viên (Lớp: ${classCode})` : `Thêm Sinh viên mới vào Lớp: ${classCode}`;
  const dialogDescription = defaultValues?.id
    ? "Cập nhật thông tin chi tiết cho sinh viên."
    : `Điền thông tin để thêm sinh viên mới vào lớp ${classCode}.`;

  // The classCode is contextual, StudentForm itself doesn't need it as a field
  // but onSave might need it if the API requires it for adding student to a class.
  const handleFormSubmit = (values: StudentFormValues) => {
    onSave(values, defaultValues?.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <StudentForm
          onSubmit={handleFormSubmit}
          onCancel={onCancel}
          defaultValues={defaultValues}
          isLoading={isLoading}
          // classCode={classCode} // Pass to StudentForm if it needs it directly
        />
      </DialogContent>
    </Dialog>
  );
} 