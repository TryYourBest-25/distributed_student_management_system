'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/types/auth';
import { columns as lecturerColumnsDefinition } from '@/components/features/lecturers/lecturer-columns';
import { LecturerDataTable } from '@/components/features/lecturers/lecturer-data-table';
import PageHeader from '@/components/core/page-header';
import { useLecturers, useDeleteLecturer, useCreateLecturer, useUpdateLecturer } from '@/hooks/use-lecturers';
import { Lecturer, lecturerToApiRequest } from '@/types/lecturer';
import { LecturerFormValues } from '@/lib/validators/lecturer-validator';
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

// Mock faculties data
const mockFaculties = [
  { faculty_code: 'CNTT', faculty_name: 'Khoa Công nghệ Thông tin' },
  { faculty_code: 'DTVT', faculty_name: 'Khoa Điện tử Viễn thông' },
  { faculty_code: 'CK', faculty_name: 'Khoa Cơ khí' },
];

export default function LecturersPage() {
  const { data: session } = useSession();
  const [lecturerToDelete, setLecturerToDelete] = useState<Lecturer | null>(null);
  
  // API hooks
  const { data: lecturersData, isLoading } = useLecturers();
  const deleteLecturerMutation = useDeleteLecturer();
  const createLecturerMutation = useCreateLecturer();
  const updateLecturerMutation = useUpdateLecturer();

  const userRoles = session?.user?.roles || [];
  const canManage = userRoles.includes('PGV');

  const handleDeleteLecturer = (lecturer: Lecturer) => {
    setLecturerToDelete(lecturer);
  };

  const columns = lecturerColumnsDefinition({ 
    canManage,
    onDelete: handleDeleteLecturer,
  });

  const confirmDeleteLecturer = async () => {
    if (lecturerToDelete) {
      try {
        await deleteLecturerMutation.mutateAsync(lecturerToDelete.lecturer_code);
        setLecturerToDelete(null);
      } catch (error) {
        console.error('Error deleting lecturer:', error);
      }
    }
  };

  const handleSaveLecturer = async (lecturerData: LecturerFormValues, existingLecturerCode?: string) => {
    try {
      const apiData = lecturerToApiRequest({
        lecturer_code: lecturerData.lecturer_code,
        first_name: lecturerData.first_name,
        last_name: lecturerData.last_name,
        degree: lecturerData.degree || undefined,
        academic_rank: lecturerData.academic_rank || undefined,
        specialization: lecturerData.specialization || undefined,
        faculty_code: lecturerData.faculty_code,
      });

      if (existingLecturerCode) {
        await updateLecturerMutation.mutateAsync({
          lecturerCode: existingLecturerCode,
          data: apiData,
        });
      } else {
        await createLecturerMutation.mutateAsync(apiData);
      }
    } catch (error) {
      console.error('Error saving lecturer:', error);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Quản lý Giảng viên" />
      
      <LecturerDataTable
        columns={columns}
        data={lecturersData?.items || []}
        isLoading={isLoading}
        canManage={canManage}
        availableFaculties={mockFaculties}
        onSave={handleSaveLecturer}
        onDelete={handleDeleteLecturer}
      />

      <AlertDialog open={!!lecturerToDelete} onOpenChange={() => setLecturerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa giảng viên</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa giảng viên <strong>{lecturerToDelete?.full_name}</strong>?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteLecturer}
              disabled={deleteLecturerMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLecturerMutation.isPending ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 